export const ADD_PROFILE = 'profiles/ADD_PROFILE';
export const ERROR = 'profiles/ERROR';

import R from 'ramda';
import invariant from 'invariant';

import {
  getKeysFromIfplId,
} from '../../selectors/flightKeys';

import {
  postToB2B,
} from '../../lib/b2b';

import {
  parseDelay,
} from '../../lib/b2b/utils';

import {
  retrieveByKeys,
  parseResponse,
} from '../../lib/b2b/flight/retrieveFlight';

import {
  invalidIfplId,
} from '../flightKeys';

import {
  getWhitelist,
} from '../../lib/b2b/whitelist';

import {
  cleanPointProfile,
  cleanAirspaceProfile,
  mergeAirspacesIntoPointProfile,
} from './profileParser';

import {
  markForHistory,
} from '../history';

import {
  opsLog,
} from '../../logger';


export function fetchProfileFromIfplId(ifplId) {
  return (dispatch, getState) => {
    // First, try to pull keys from local store
    const keys = getKeysFromIfplId(ifplId)(getState());

    // Nothing in our cache for this ifplId, reject
    if(!keys) {
      return Promise.reject(new Error('not found !'));
    }

    const {
      callsign,
      departure,
      destination,
      eobt,
    } = keys;

    const body = retrieveByKeys(callsign, departure, destination, eobt);

    // We've got proper keys, hit b2b for profile
    return postToB2B({body})
      .then(parseResponse)
      // Then build a profile object
      .then(resp => {
        const flight = R.pathOr(null, ['data', 'flight'], resp);
        if(!flight) {
          dispatch(invalidIfplId(ifplId));
          return Promise.reject(new Error('Not found'));
        }

        const aircraftType = R.prop('aircraftType', flight);
        const delay = R.pipe(
          R.prop('delay'),
          parseDelay,
        )(flight);

        const rawPointProfile = R.either(
          R.propOr(null, 'rtfmPointProfile'),
          R.propOr(null, 'ftfmPointProfile'),
        )(flight);

        const rawAirspaceProfile = R.either(
          R.propOr(null, 'rtfmAirspaceProfile'),
          R.propOr(null, 'ftfmAirspaceProfile'),
        )(flight);

        const airspaceProfile = R.pipe(
          airspaceProfile => cleanAirspaceProfile(airspaceProfile, getWhitelist()),
        )(rawAirspaceProfile);

        const pointProfile = R.pipe(
          cleanPointProfile,
          mergeAirspacesIntoPointProfile(airspaceProfile),
        )(rawPointProfile);

        return {
          aircraftType,
          delay,
          pointProfile,
          airspaceProfile,
        };
      })
      .then(profile => {
        // Then add returned data to our local cache
        dispatch(addProfile(ifplId, profile));
        // Then add to history
        dispatch(markForHistory(ifplId));
        return profile;
      })
      .then(profile => {
        opsLog({ifplId, result: profile, fetchProfile: true}, "fetchProfile");
        return profile;
      })
      .catch(err => {
        const error = {
          ...err,
          keys,
        };

        dispatch(errorAction(error));
        // Let error bubble up
        return Promise.reject(error);
      });
  };
}


export const addProfile = (ifplId, profile = {}) => {
  invariant(
    ifplId && typeof ifplId === 'string',
    'Argument error: ifplId must be a string',
  );

  invariant(
    profile && !R.isEmpty(profile),
    'Argument error: profile must be a non empty object',
  );

  const when = new Date();

  return {
    type: ADD_PROFILE,
    ifplId,
    when,
    profile,
  };
}

const errorAction = (error) => ({
  type: ERROR,
  error,
});
