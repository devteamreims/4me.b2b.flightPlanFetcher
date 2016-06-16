import _ from 'lodash';
import d from 'debug';
const debug = d('4me.history.actions');

import {
  opsLog,
} from '../logger';

export const ADD_FLIGHT_TO_HISTORY = 'ADD_FLIGHT_TO_HISTORY';
export const REMOVE_FLIGHT_FROM_HISTORY = 'REMOVE_FLIGHT_FROM_HISTORY';
export const ERROR = 'history/ERROR';

export function addToHistory(flight) {
  return {
    type: ADD_FLIGHT_TO_HISTORY,
    payload: flight,
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
  fetchFlight,
} from './flight-plans';

import {
  getSocket
} from '../socket';

// Force fetch flight from B2B
export function fetchProfile(ifplId, forceRefresh = false) {
  return (dispatch, getState) => {
    const prefetchedKeys = getKeysFromIfplId(ifplId)(getState());

    // Here we handle the case of a flight which is not in history
    if(_.isEmpty(prefetchedKeys)) {
      return ifplIdToKeys(ifplId)
        .then((keys) => {

          const { callsign } = keys;
          // Redispatch with local cache
          return dispatch(fetchFlight(callsign))
            .then((res) => {
              // No keys found, break out
              if(_.isEmpty(res)) {
                return Promise.reject('Unknown flight');
              }
              return dispatch(fetchProfile(ifplId, forceRefresh))
            });
        })
    }

    debug(`Fetching ifplId : ${ifplId}`);
    debug(prefetchedKeys);

    const {
      callsign,
      departure,
      destination,
      eobt,
      aircraftType,
    } = prefetchedKeys;

    const fromHistory = getFromIfplId(ifplId)(getState());

    // We have data in cache, return this
    if(!forceRefresh && !_.isEmpty(fromHistory)) {
      debug(`fetchProfile ${ifplId} : returning data from local cache`);
      opsLog({ifplId, result: fromHistory, forceRefresh}, {fetchProfile: true});
      return Promise.resolve(fromHistory);
    }

    return requestProfile(callsign, departure, destination, eobt)
      .then(resp => {
        const status = _.get(resp, 'status');
        if(status !== 'OK') {
          return Promise.reject(resp);
        }

        const flight = _.get(resp, 'body.flight');

        // Delay : 0109 => 1 hour, 60 minutes;
        const formatDelay = (str) => {
          if(!str) {
            return 0;
          }
          const hours = parseInt(str.substr(0, 2)) || 0;
          const minutes = (parseInt(str.substr(2)) || 0) + hours * 60;
          return minutes;
        };

        const delay = formatDelay(_.get(flight, 'delay', 0));
        const aircraftType = _.get(flight, 'aircraftType', 'ZZZZ');

        const pointProfile = parseProfile(flight);
        const airspaceProfile = _.get(flight, 'rtfmAirspaceProfile') || _.get(flight, 'ftfmAirspaceProfile');

        return {
          callsign,
          ifplId,
          departure,
          destination,
          eobt,
          delay,
          aircraftType,
          fetched: Date.now(),
          pointProfile,
          airspaceProfile,
        };
      })
      .then(formattedProfile => {
        dispatch(addToHistory(formattedProfile));
        opsLog({ifplId, result: formattedProfile, forceRefresh}, {fetchProfile: true});
        const socket = getSocket();
        if(socket && socket.emit) {
          debug('Emitting history update to sockets');
          socket.emit('update_history', getHistory(getState()));
        }
        return formattedProfile;
      })
      .catch(err => {
        const { message = 'Unknown error' } = err;
        dispatch(errorAction(message));
        return Promise.reject(message);
      });
  };
}

function errorAction(error) {
  return {
    type: ERROR,
    error,
  };
}

import {
  parsePoint,
  nonVectorPoint
} from '../lib/b2b/response-parser';

function parseProfile(flight) {
  const profile = _.get(flight, 'rtfmPointProfile') || _.get(flight, 'ftfmPointProfile');
  const airspaceProfile = _.get(flight, 'rtfmAirspaceProfile') || _.get(flight, 'ftfmAirspaceProfile');

  debug(airspaceProfile);

  return _(profile)
    .filter(nonVectorPoint)
    .map(parsePoint)
    .value();
}
