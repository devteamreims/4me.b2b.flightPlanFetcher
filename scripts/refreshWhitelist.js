import {} from 'dotenv/config';

/**
 * This script will download a full AIXM dataset from NM B2B
 * Then it'll extract elementary sectors definition to populate a whitelist
 * of possible elementary sectors returned by an airspaceProfile request
 */


import {
  requestLatestAixmAirspace,
  getRequestOptions,
} from '../src/lib/b2b';

import request from 'request';
import R from 'ramda';
import unzip from 'unzip';

import fs from 'fs';
import readline from 'readline';
import XmlStream from 'xml-stream';
import moment from 'moment';

const extractDatasets = R.path([
  'airspace:CompleteAIXMDatasetReply',
  'data',
  'datasetSummaries',
]);

const extractLatestItem = R.pipe(
  R.sortBy(R.prop('publicationDate')),
  R.reverse,
  R.head,
);

const matchAirspace = R.pipe(
  R.prop('id'),
  R.test(/Airspace/),
);

const getFilepath = R.pipe(
  R.prop('files'),
  R.find(matchAirspace),
  R.pick(['id', 'releaseTime']),
);

const prepareUrl = filePath => `https://www.b2b.nm.eurocontrol.int/FILE_OPS/gateway/spec/${filePath}`;

const startTime = Date.now();

console.log('Pulling latest AIXM data from B2B ...');
requestLatestAixmAirspace()
  .then(extractDatasets)
  .then(extractLatestItem)
  .then(getFilepath)
  .then(({id, releaseTime}) => {
    console.log(`Latest AIXM data timestamp : ${releaseTime}`);
    return prepareUrl(id);
  })
  .then(url => {
    const p = new Promise((resolve, reject) => {
      request.defaults(getRequestOptions())
        .get(url)
        .pipe(unzip.Parse())
        .on('entry', entry => {
          const fileName = entry.path;
          let results = [];
          const xml = new XmlStream(entry);

          xml.collect('aixm:AirspaceTimeSlice');
          xml.on('endElement: aixm:AirspaceTimeSlice', item => {
            const type = R.prop('aixm:type', item);

            if(type === 'SECTOR') {
              const airspaceName = R.prop('aixm:designator', item);
              results.push(airspaceName);
            }
          });

          xml.on('end', () => {
            resolve(results);
          })
        });
    });
    return p;
  })
  // Here, we have an array of strings, each one corresponding to an elementary sector
  // airspace designator
  .then(res => {
    const duration = moment.duration(Date.now() - startTime);
    console.log(`Pulled ${res.length} sectors in ${duration.seconds()} seconds`);

    const outputPath = process.env.ES_WHITELIST_PATH;
    if(outputPath) {
      fs.writeFileSync(outputPath, JSON.stringify(res));
      console.log(`Wrote ${outputPath}`);
    }
  });
