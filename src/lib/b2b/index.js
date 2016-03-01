
import {
  createClient,
  ClientSSLSecurityPFX
} from 'soap-as-promised';

import moment from 'moment';

import request from 'request';

const timeFormat = 'YYYY-MM-DD HH:mm';
const timeFormatWithSeconds = timeFormat + ':ss';

import fs from 'fs';

let soapClient;

export function getClient(wsdl) {
  if(soapClient === undefined) {
    return initClient(wsdl).then(client => {
      soapClient = client;
      return Promise.resolve(soapClient);
    });
  }
  return Promise.resolve(soapClient);
}


function initClient(wsdl = __dirname + '/wsdl/FlightServices_PREOPS_19.0.0.wsdl', options) {
  const certFile = process.env.B2B_CERT;
  const certKey = process.env.B2B_KEY;

  const sslSecurity = new ClientSSLSecurityPFX(certFile, certKey);

  const myHttpClient = {
    request: function() {
      console.log('Called !!!');
      console.log(arguments);
      return request(...arguments);
    }
  };

  return createClient(wsdl
    //,{httpClient: myHttpClient}
  ).then(client => {
    client.setSecurity(sslSecurity)
    return client;
  });
}

export function requestByCallsign(callsign, options = {}) {

  const sendTime = moment().format(timeFormatWithSeconds);

  const wef = moment().subtract(12, 'hours').format(timeFormat);
  const unt = moment().add(12, 'hours').format(timeFormat);

  // Rmk. 1 : Order of parameters matters
  // Rmk. 2 : ':' is there to avoid namespacing issues
  const queryParams = {
    ':sendTime': sendTime,
    ':aircraftId': callsign,
    ':nonICAOAerodromeOfDeparture': false,
    ':airFiled': false,
    ':nonICAOAerodromeOfDestination': false,
    ':estimatedOffBlockTime': {
      ':wef': wef,
      ':unt': unt
    }
  };

  return getClient()
    .then((client) => {
      
      console.log(client
        .describe()
        .FlightManagementService
        .FlightManagementPort
        .retrieveFlight
      );

      return client
        .FlightManagementService
        .FlightManagementPort
        .queryFlightPlans(queryParams);

    });
}