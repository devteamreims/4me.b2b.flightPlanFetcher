
import {
  getClient,
  requestByCallsign
} from './lib/b2b';

import _ from 'lodash';

export function getSearchFlightsRoute(store) {
  return (req, res, next) => {
    let c;

    const {callsign, raw} = req.query;

    // Do some preflight check of callsign

    if(callsign === undefined) {
      throw new Error('Callsign parameter must exist');
    }

    const keepValid = (summary) => summary.lastValidFlightPlanId !== undefined;

    const formatResponse = (rawData) => {

      if(raw !== undefined) {
        return rawData;
      }

      return _(_.get(rawData, 'data.summaries', []))
          .filter(keepValid)
          .map(s => s.lastValidFlightPlanId)
          .uniqBy('id')
          .value();
    };


    getClient()
    .then((client) => {
      c = client;
      return requestByCallsign(callsign);
    })
    .then(formatResponse)
    .then(resp => res.send(resp))
    .catch(err => {
      res.send({
        error: err,
        lastRequest: c.lastRequest
      });
      throw err;
      return;
    });
  }
}

export function getSearchProfilesRoute(store) {
  return (req, res, next) => {
    res.send({caca: 'caca'});
  }
}

export function getSoapRoute(store) {
  return (req, res, next) => {
    getClient()
    .then((client) => {
      res.send(client
        .describe()
        .FlightManagementService
        .FlightManagementPort
        .retrieveFlight);
    });
  }
}

export function getHistoryRoute(store) {
  return (req, res, next) => {
    res.send({history: 'BLABLA'});
  }
}