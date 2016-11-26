import {
  fetchFlight
} from '../actions/flight-plans';

import {
  fetchKeysForCallsign,
} from '../actions/flightKeys';

import {
  fetchProfile
} from '../actions/history';

import {
  fetchProfileFromIfplId,
} from '../actions/profiles';

import {
  getProfilesInHistory,
} from '../selectors/history';

import {
  getFromIfplId as getProfileFromIfplId,
} from '../selectors/profiles';

import d from 'debug';
const debug = d('4me.controller');

import _ from 'lodash';
import R from 'ramda';

export function getSearchFlightsRoute(store) {
  return (req, res, next) => {
    const {callsign, raw} = req.query;

    // Do some preflight check of callsign

    if(callsign === undefined) {
      throw new Error('Callsign parameter must exist');
    }

    store.dispatch(fetchKeysForCallsign(callsign))
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


    const cachedProfile = getProfileFromIfplId(ifplId)(store.getState());

    let promise;
    if(forceRefresh || !cachedProfile) {
      // Do not care about anything in store
      promise = store.dispatch(fetchProfileFromIfplId(ifplId));
    } else {
      promise = Promise.resolve();
    }


    promise
      .then(() => getProfileFromIfplId(ifplId)(store.getState()))
      .then(profile => res.send(profile))
      .catch(err => next(err));
  }
}

export function getHistoryRoute(store) {
  return (req, res, next) => {
    const history = getProfilesInHistory(store.getState());

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
} from '../selectors/autocomplete';

export function getAutocomplete(store) {
  return (req, res, next) => {
    const { search } = req.query;
    const getResults = getFromString(search);

    res.send(getResults(store.getState()));
  };
}


export {getStatus} from './status';
