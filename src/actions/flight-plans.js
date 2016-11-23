export const ADD_FLIGHT_PLAN = 'ADD_FLIGHT_PLAN';
export const REMOVE_FLIGHT_PLAN = 'REMOVE_FLIGHT_PLAN';
export const ERROR = 'flightPlans/ERROR';

import {
  postToB2B,
} from '../lib/b2b';

import {
  queryByCallsign,
  parseResponse as parseFlightPlanResponse,
} from '../lib/b2b/flight/queryFlightPlans';

import {
  opsLog,
} from '../logger';

import _ from 'lodash';
import R from 'ramda';

import moment from 'moment';

import d from 'debug';
const debug = d('4me.flight-plans.actions');

export function fetchFlight(callsign) {
  return (dispatch, getState) => {
    const body = queryByCallsign(callsign);
    // Fetch from B2B
    return postToB2B({body})
      .then(parseFlightPlanResponse)
      .then(resp => {
        let flightPlans = R.pathOr([], ['data', 'summaries'], resp);
        if(!R.isArrayLike(flightPlans)) {
          flightPlans = [flightPlans];
        }

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
          R.forEach(f => dispatch(addFlightToCache(f)))
        )(flightPlans);
      })
      // If all went well, produce ops log for this request
      .then(processed => {
        opsLog({callsign, reponse: processed, requestByCallsign: true}, 'requestByCallsign');
        return processed;
      })
      .catch(err => {
        debug(err);
        const { message = 'Unknown error' } = err;
        dispatch(errorAction(message));
        return Promise.reject(err);
      });
  };
}

function addFlightToCache(flight) {
  return {
    type: ADD_FLIGHT_PLAN,
    ...flight,
  };
}

function errorAction(error) {
  return {
    type: ERROR,
    error,
  };
}
