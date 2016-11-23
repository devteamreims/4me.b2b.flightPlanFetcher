import moment from 'moment';

import rp from 'request-promise';

import d from 'debug';
const debug = d('4me.lib.b2b');

const timeFormat = 'YYYY-MM-DD HH:mm';
const timeFormatWithSeconds = timeFormat + ':ss';

import fs from 'fs';

import _ from 'lodash';
import R from 'ramda';

import {
  parseString as parseStringCb
} from 'xml2js';

import {
  queryFlightPlans,
  queryInTrafficVolume,
  retrieveFlight,
  flightKeysFromIfplId,
  queryCompleteAIXMDataset,
} from './query-builder';

import {
  query as queryInAirspace,
  parseResponse as parseQueryInAirspace,
} from './flight/queryInAirspace';

import {
  parseFlightPlanListReply,
  parseFlightRetrievalReply,
  flightPlanToKeys,
  normalizeFlightPlan,
} from './response-parser';


function toJS(input) {
  const callback = (resolve, reject) => (err, stdout, stderr) => {
    if(err) {
      return reject(new Error('Unable to parse invalid data'));
    }
    return resolve(stdout);
  };

  return new Promise((resolve, reject) => parseStringCb(input, {explicitArray: false}, callback(resolve, reject)));
}

const extractData = (data) => {
  debug(_.get(data, 'S:Envelope.S:Body', {}));
  return _.get(data, 'S:Envelope.S:Body', {});
};

let pfxContent;


export function getRequestOptions() {

  if(process.env.NODE_ENV !== 'test' && pfxContent === undefined) {
    pfxContent = fs.readFileSync(process.env.B2B_CERT);
  }

  const nmUrl = process.env.B2B_URL;

  if(!nmUrl) {
    throw new Error('Please define a B2B_URL env variable');
  }

  const requestOptions = {
    uri: nmUrl,
    agentOptions: {
      pfx: pfxContent,
      passphrase: process.env.B2B_KEY,

    },
    headers: {
      'Content-Type': 'text/xml'
    },
    timeout: parseInt(process.env.B2B_MAX_REQUEST_TIME, 10) || 30*1000, // 30 seconds timeout
  };

  // In test env, do not use certificate to sign requests
  if(process.env.NODE_ENV === 'test') {
    delete requestOptions.agentOptions;
  }

  return requestOptions;
}

export function postToB2B(data) {
  const MAX_REQUEST_SIZE = parseInt(process.env.B2B_MAX_REQUEST_SIZE) || 1024*1024*2; // 2MB

  return new Promise((resolve, reject) => {
    const r = rp.defaults(getRequestOptions()).post(data);

    let dataLen = 0;

    r.on('data', data => {
      dataLen += _.size(data);

      if(dataLen > MAX_REQUEST_SIZE) {
        debug(`Aborting request due to B2B_MAX_REQUEST_SIZE : ${MAX_REQUEST_SIZE}`);
        reject(new Error('Response exceeds B2B_MAX_REQUEST_SIZE'));
        r.abort();
      }
    });


    r.on('response', res => {
      const headerSize = _.get(res, 'headers.content-length', 0);

      if(headerSize > MAX_REQUEST_SIZE) {
        debug(`Aborting request due to B2B_MAX_REQUEST_SIZE : ${MAX_REQUEST_SIZE}`);
        reject(new Error('Response exceeds B2B_MAX_REQUEST_SIZE'));
        r.abort();
      }
    });

    r.then(resolve, reject);
  });
}


export function requestByCallsign(callsign, options = {}) {
  const body = queryFlightPlans(callsign);
  debug('requestByCallsign');
  debug(body);

  return postToB2B({body})
    .then(toJS)
    .then(extractData)
    .then(parseFlightPlanListReply);
}

export function requestByIfplId(ifplId, options = {}) {
  const body = flightKeysFromIfplId(ifplId, options);

  debug('requestByIfplId');
  debug(body);

  return postToB2B({body})
    .then(toJS)
    .then(extractData);
}

export function ifplIdToKeys(ifplId, options = {}) {
  return requestByIfplId(ifplId)
    .then((data) => {
      const flightPlan = _.get(data, 'flight:FlightRetrievalReply.data.flightPlan');
      if(!flightPlan) {
        return Promise.reject('Unknown flight');
      }

      const ret = flightPlanToKeys(flightPlan);
      if(_.isEmpty(ret)) {
        return Promise.reject('Unknown flight');
      }
      return ret;
    })
}

export function requestProfile(callsign, dep, dest, eobt, options = {}) {

  const sendTime = moment.utc().format(timeFormatWithSeconds);

  const formattedEobt = moment(new Date(eobt)).format(timeFormat);

  const body = retrieveFlight(callsign, dep, dest, eobt);
  debug(body);

  return postToB2B({body})
    .then(toJS)
    .then(extractData)
    .then(parseFlightRetrievalReply);
}

export function requestLatestAixmAirspace() {
  const sendTime = moment.utc().format(timeFormatWithSeconds);

  const body = queryCompleteAIXMDataset();

  return postToB2B({body})
    .then(toJS)
    .then(extractData);
}
