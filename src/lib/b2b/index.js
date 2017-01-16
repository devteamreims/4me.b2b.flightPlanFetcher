import moment from 'moment';

import rp from 'request-promise';
import R from 'ramda';
import d from 'debug';
const debug = d('4me.lib.b2b');


import fs from 'fs';

let pfxContent;


export function getRequestOptions() {

  if(process.env.NODE_ENV !== 'test' && pfxContent === undefined) {
    try {
      pfxContent = fs.readFileSync(process.env.B2B_CERT);
    } catch(err) {
      throw new Error('Could not read B2B certificate file !');
    }
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
      dataLen += R.length(data);

      if(dataLen > MAX_REQUEST_SIZE) {
        debug(`Aborting request due to B2B_MAX_REQUEST_SIZE : ${MAX_REQUEST_SIZE}`);
        reject(new Error('Response exceeds B2B_MAX_REQUEST_SIZE'));
        r.abort();
      }
    });


    r.on('response', res => {
      const headerSize = R.pathOr(0, ['headers', 'content-length'], res);

      if(headerSize > MAX_REQUEST_SIZE) {
        debug(`Aborting request due to B2B_MAX_REQUEST_SIZE : ${MAX_REQUEST_SIZE}`);
        reject(new Error('Response exceeds B2B_MAX_REQUEST_SIZE'));
        r.abort();
      }
    });

    r.then(resolve, reject);
  });
}
