import d from 'debug';
const debug = d('4me.b2b.whitelist');

import request from 'request';
import R from 'ramda';
import unzip from 'unzip';

import fs from 'fs';
import readline from 'readline';
import XmlStream from 'xml-stream';
import moment from 'moment';

import {
  requestLatestAixmAirspace,
  getRequestOptions,
} from './index';

let whitelist = [];

export function isWhitelisted(sector) {
  return R.contains(sector, whitelist);
}

/**
 * Utility functions
 */
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

// On startup, fetch whitelist
getWhitelist()
  .then(res => whitelist = R.clone(res));


const prepareDatasetUrl = filePath => `https://www.b2b.nm.eurocontrol.int/FILE_OPS/gateway/spec/${filePath}`;

/**
 * Returns a Promise for an ES whitelist
 * During tests, do not hit B2B
 * @return [String] Array of strings representing elementary sectors
 */
function getWhitelist() {

  if(process.env.NODE_ENV === 'test') {
    return Promise.resolve(['LFEEKD', 'LFEEUR', 'LFEEKR']);
  }

  const startTime = Date.now();

  debug('Pulling latest AIXM data from B2B ...');
  return requestLatestAixmAirspace()
    .then(extractDatasets)
    .then(extractLatestItem)
    .then(getFilepath)
    .then(({id, releaseTime}) => {
      debug(`Latest AIXM data timestamp : ${releaseTime}`);
      return prepareDatasetUrl(id);
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
      debug(`Pulled ${res.length} sectors in ${duration.seconds()} seconds`);

      return res;
    });
}
