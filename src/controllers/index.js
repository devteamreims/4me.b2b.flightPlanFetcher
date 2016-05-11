import {
  fetchFlight
} from '../actions/flight-plans';

import {
  fetchProfile
} from '../actions/history';

import {
  parsePoint
} from '../lib/b2b/response-parser';

import {
  getHistory
} from '../selectors/history';

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

    store.dispatch(fetchFlight(callsign))
      .then(resp => res.send(resp))
      .catch(err => next(err));
  }
}

export function getSearchProfilesRoute(store) {
  return (req, res, next) => {

    const { ifplId, forceRefresh } = req.query;

    if(!ifplId) {
      throw new Error('ifplId must be set');
    }

    store.dispatch(fetchProfile(ifplId, forceRefresh !== undefined))
      .then(resp => res.send(Object.assign({}, resp, {ifplId})))
      .catch(err => next(err));
  }
}

export function getHistoryRoute(store) {
  return (req, res, next) => {
    const history = getHistory(store.getState());

    res.send(_.take(
      history,
      req.query.limit || history.length
    ));
  }
}


import {
  requestByTrafficVolume
} from '../lib/b2b';

import {
  getFromString,
} from '../selectors/autocomplete-cache';

export function getAutocomplete(store) {
  return (req, res, next) => {
    const { search } = req.query;
    const getResults = getFromString(search);

    res.send(getResults(store.getState()));
  };
}


export {getStatus} from './status';
