
import {
  requestByCallsign,
  fetchProfile
} from './lib/b2b';

import d from 'debug';
const debug = d('4me.controller');

import _ from 'lodash';

export function getSearchFlightsRoute(store) {
  return (req, res, next) => {
    const {callsign, raw} = req.query;

    // Do some preflight check of callsign

    if(callsign === undefined) {
      throw new Error('Callsign parameter must exist');
    }

    requestByCallsign(callsign)
      .then(resp => res.send(resp))
      .catch(function (err) {
        debug('POUET');
        debug(arguments);
        next(err);
      });
  }
}

export function getSearchProfilesRoute(store) {
  return (req, res, next) => {
    fetchProfile()
      .then(resp => {
        const originalFtfm = resp.body.flight.ftfmPointProfile;
        const originalCtfm = resp.body.flight.ctfmPointProfile;

        const filterPoint = (p) => p.point !== undefined && p.point.pointId !== undefined;

        const ftfm = _(originalFtfm)
          .filter(filterPoint)
          .map(p => p.point.pointId)
          .value();

        const ctfm = _(originalCtfm)
          .filter(filterPoint)
          .map(p => p.point.pointId)
          .value();

        return Object.assign({}, resp, {
          ftfmCount: ftfm.length,
          ctfmCount: ctfm.length,
          ftfm,
          ctfm
        });
      })
      .then(resp => res.send(resp))
      .catch(function (err) {
        debug('POUET');
        debug(arguments);
        next(err);
      });
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
        .queryFlightPlans);
    });
  }
}

export function getHistoryRoute(store) {
  return (req, res, next) => {
    res.send({history: 'BLABLA'});
  }
}