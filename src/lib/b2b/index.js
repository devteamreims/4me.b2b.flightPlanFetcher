import moment from 'moment';

import rp from 'request-promise';

import d from 'debug';
const debug = d('4me.lib.b2b');

const timeFormat = 'YYYY-MM-DD HH:mm';
const timeFormatWithSeconds = timeFormat + ':ss';

import fs from 'fs';

import _ from 'lodash';

import {
  parseString as parseStringCb
} from 'xml2js';

import {
  queryFlightPlans,
  retrieveFlight,
  flightKeysFromIfplId
} from './query-builder';

import {
  parseFlightPlanListReply,
  parseFlightRetrievalReply,
  flightPlanToKeys
} from './response-parser';


function toJS(input) {
  const callback = (resolve, reject) => (err, stdout, stderr) => {
    if(err) {
      return reject(err);
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

const nmUrl = 'https://www.nm.eurocontrol.int:16443/B2B_OPS/gateway/spec/19.0.0';

function myRequest() {

  if(pfxContent === undefined) {
    pfxContent = fs.readFileSync(process.env.B2B_CERT);
  }

  const requestOptions = {
    uri: nmUrl,
    agentOptions: {
        pfx: pfxContent,
        passphrase: process.env.B2B_KEY
    },
    headers: {
        'Content-Type': 'text/xml'
    },
  };

  return rp.defaults(requestOptions);
}


export function requestByCallsign(callsign, options = {}) {
  const body = queryFlightPlans(callsign);
  debug('requestByCallsign');
  debug(body);

  return myRequest()
    .post({body})
    .then(toJS)
    .then(extractData)
    .then(parseFlightPlanListReply);
}

export function requestByIfplId(ifplId, options = {}) {
  const body = flightKeysFromIfplId(ifplId, options);

  debug('requestByIfplId');
  debug(body);

  return myRequest()
    .post({body})
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

  return myRequest()
    .post({body})
    .then(toJS)
    .then(extractData)
    .then(parseFlightRetrievalReply);
}
