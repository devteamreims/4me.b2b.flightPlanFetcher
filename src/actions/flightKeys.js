export const ADD_KEYS = 'flightKeys/ADD_KEYS';
export const ADD_BULK_KEYS = 'flightKeys/ADD_BULK_KEYS';
export const INVALID_KEYS = 'flightKeys/INVALID_KEYS';
export const ERROR = 'flightKeys/ERROR';

import invariant from 'invariant';
import moment from 'moment';
import R from 'ramda';

import {
  postToB2B,
} from '../lib/b2b';

import {
  queryByCallsign,
  parseResponse as parseFlightPlanResponse,
} from '../lib/b2b/flight/queryFlightPlans';

import {
  getKeysFromCallsign,
} from '../selectors/flightKeys';

import {
  opsLog,
} from '../logger';

/**
 * Redux-thunk action creator
 * Will search for keys in the local store or send a b2b request
 * @param  {string} callsign Callsign to look for
 * @param  {Object} Options Options for the request
 * @return {Promise<keys>}   A Promise of resulting keys, formated according to the redux store
 */
export function fetchKeysForCallsign(callsign, options = {}) {
  return (dispatch, getState) => {
    // Handle options
    const {
      forceRefresh = false,
    } = options;

    invariant(
      callsign && typeof callsign === 'string',
      'Argument error: a callsign must be provided',
    );

    // Look for stuff in local store first
    const keysFromCache = getKeysFromCallsign(callsign)(getState());
    if(!forceRefresh && keysFromCache) {
      return Promise.resolve(keysFromCache);
    }

    // Hit B2B here
    const body = queryByCallsign(callsign);
    return postToB2B({body})
      .then(parseFlightPlanResponse)
      .then(resp => {
        // At this point we have a response, prepare data
        const flightPlans = R.pipe(
          R.pathOr([], ['data', 'summaries']),
          // If we have a single element, make an array out of it so we can map over it
          R.unless(
            R.isArrayLike,
            R.of,
          )
        )(resp);

        const withStatus = status => R.propEq('status', status);

        // This pipe here extracts raw b2b data and converts it to a more suitable format
        return R.pipe(
          // First get lastValidFlightPlan items
          R.map(R.propOr({}, 'lastValidFlightPlan')),
          // Reject those with `BACKUP` status
          R.reject(withStatus('BACKUP')),
          // Now, transform each flight plan
          R.map(flightPlan => {
            const ifplId = R.path(['id', 'id'], flightPlan);
            if(!ifplId) {
              return null;
            }

            const status = R.propOr('UNKNOWN', 'status', flightPlan);
            const cs = R.pathOr(callsign, ['id', 'keys', 'aircraftId'], flightPlan);
            const departure = R.pathOr('ZZZZ', ['id', 'keys', 'aerodromeOfDeparture'], flightPlan);
            const destination = R.pathOr('ZZZZ', ['id', 'keys', 'aerodromeOfDestination'], flightPlan);

            const eobt = R.path(['id', 'keys', 'estimatedOffBlockTime'], flightPlan);
            const fetched = moment.utc().format();

            const flight = {
              ifplId,
              status,
              callsign: cs,
              departure,
              destination,
              eobt,
              fetched,
            };

            const getPropsFromFlightPlan = R.applySpec({
              callsign: R.pathOr(callsign, ['id', 'keys', 'aircraftId']),
              departure: R.pathOr('ZZZZ', ['id', 'keys', 'aerodromeOfDeparture']),
              destination: R.pathOr('ZZZZ', ['id', 'keys', 'aerodromeOfDestination']),
              eobt: R.pathOr('', ['id', 'keys', 'estimatedOffBlockTime']),
              status: R.propOr('UNKNOWN', 'status'),
            });

            return {
              ifplId,
              fetched,
              ...getPropsFromFlightPlan(flightPlan)
            };
          }),
          // Reject anomalies
          R.reject(R.isNil),
          // Reject duplicates
          R.uniqBy(R.prop('ifplId')),
          // Dispatch redux actions to populate our local cache
          R.forEach(f => dispatch(addKeys(f)))
        )(flightPlans);
      })
      .then(processed => {
        opsLog({callsign, reponse: processed, requestByCallsign: true}, 'requestByCallsign');
        return processed;
      })
      .catch(err => {
        dispatch(errorAction(err.message || 'Unknown error'));
        return Promise.reject(err);
      });
  };
}

/**
 * Throw an error when the received object doesn't respect constraints
 * @param  {Object} [keys={}] keys
 * @return {Object}           keys
 */
const ensureKeysAreValid = (keys = {}) => {
  const {
    ifplId,
    callsign,
    departure,
    destination,
    eobt,
    status,
  } = keys;

  invariant(
    ifplId && typeof ifplId === 'string',
    'Argument error: ifplId must be a string',
  );

  invariant(
    callsign && typeof callsign === 'string',
    'Argument error: callsign must be a string',
  );

  invariant(
    departure && typeof departure === 'string',
    'Argument error: departure must be a string',
  );

  invariant(
    destination && typeof destination === 'string',
    'Argument error: destination must be a string',
  );

  invariant(
    eobt && typeof eobt === 'string',
    'Argument error: eobt must be a string',
  );

  invariant(
    status && typeof status === 'string',
    'Argument error: status must be a string',
  );

  return keys;
}

/**
 * addKeys action creator, this will populate redux store
 * @param {Object}
 */
export const addKeys = (keys = {}) => {
  ensureKeysAreValid(keys);

  const {
    ifplId,
    callsign,
    departure,
    destination,
    eobt,
    status,
  } = keys;

  const when = new Date();

  return {
    type: ADD_KEYS,
    ifplId,
    callsign,
    departure,
    destination,
    eobt,
    status,
    when,
  };
};

export const addBulkKeys = (keysArray) => {
  invariant(
    keysArray && R.isArrayLike(keysArray),
    'Argument error: keysArray must be an array',
  );

  R.forEach(ensureKeysAreValid, keysArray);

  const when = new Date();

  return {
    type: ADD_BULK_KEYS,
    keys: keysArray,
    when,
  };
};

export const invalidIfplId = ifplId => {
  invariant(
    ifplId && typeof ifplId === 'string',
    'Argument error: ifplId must be a string',
  );

  return {
    type: INVALID_KEYS,
    ifplId,
  };
}

const errorAction = (error) => ({
  type: ERROR,
  error,
});
