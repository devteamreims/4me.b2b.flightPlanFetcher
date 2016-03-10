import _ from 'lodash';
import d from 'debug';
const debug = d('4me.history.actions');

export const ADD_FLIGHT_TO_HISTORY = 'ADD_FLIGHT_TO_HISTORY';
export const REMOVE_FLIGHT_FROM_HISTORY = 'REMOVE_FLIGHT_FROM_HISTORY';

export function addToHistory(flight) {
  const {
    callsign,
    ifplId,
    departure,
    destination,
    eobt,
    fetched,
    pointProfile,
    delay
  } = flight;

  return {
    type: ADD_FLIGHT_TO_HISTORY,
    callsign,
    ifplId,
    departure,
    destination,
    eobt,
    fetched,
    pointProfile,
    delay
  };
}

export function removeFromHistory(ifplId) {
  return {
    type: REMOVE_FLIGHT_FROM_HISTORY,
    ifplId
  };
}

import {
  getKeysFromIfplId
} from '../selectors/flight-plans';

import {
  getFromIfplId,
  getHistory,
} from '../selectors/history';

import {
  requestProfile,
  ifplIdToKeys
} from '../lib/b2b';

import {
  ADD_FLIGHT_PLAN
} from './flight-plans';

import {
  getSocket
} from '../socket';

// Force fetch flight from B2B
export function fetchProfile(ifplId, forceRefresh = false) {
  return (dispatch, getState) => {
    const prefetchedKeys = getKeysFromIfplId(ifplId)(getState());

    // Here we rely on local history, this makes our API stateful
    // Let's query B2B for details about this IFPLId

    if(_.isEmpty(prefetchedKeys)) {
      return ifplIdToKeys(ifplId)
        .then((keys) => {

          const flight = {
            ifplId,
            fetched: Date.now(),
            ...keys,
          };

          dispatch({
            type: ADD_FLIGHT_PLAN,
            ...flight,
          });

          // Redispatch with local cache
          return dispatch(fetchProfile(ifplId, forceRefresh));
        });
    }

    debug(`Fetching ifplId : ${ifplId}`);
    debug(prefetchedKeys);

    const {
      callsign,
      departure,
      destination,
      eobt,
    } = prefetchedKeys;

    const fromHistory = getFromIfplId(ifplId)(getState());

    // We have data in cache, return this
    if(!forceRefresh && !_.isEmpty(fromHistory)) {
      debug(`fetchProfile ${ifplId} : returning data from local cache`);
      return Promise.resolve(fromHistory);
    }

    return requestProfile(callsign, departure, destination, eobt)
      .then(resp => {
        const status = _.get(resp, 'status');
        if(status !== 'OK') {
          return Promise.reject(resp);
        }

        const flight = _.get(resp, 'body.flight');
        const delay = parseInt(_.get(flight, 'delay', 0)) || 0;

        const pointProfile = parseProfile(flight);

        return {
          callsign,
          ifplId,
          departure,
          destination,
          eobt,
          delay,
          fetched: Date.now(),
          pointProfile,
        };
      })
      .then(formattedProfile => {
        dispatch(addToHistory(formattedProfile));
        const socket = getSocket();
        if(socket && socket.emit) {
          debug('Emitting history update to sockets');
          socket.emit('update_history', getHistory(getState()));
        }
        return formattedProfile;
      });
  };
}

import {
  parsePoint,
  nonVectorPoint
} from '../lib/b2b/response-parser';

function parseProfile(flight) {
  const profile = _.get(flight, 'rtfmPointProfile') || _.get(flight, 'ftfmPointProfile');

  return _(profile)
    .filter(nonVectorPoint)
    .map(parsePoint)
    .value();
}
