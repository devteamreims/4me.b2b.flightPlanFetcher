export const ADD_FLIGHT_PLAN = 'ADD_FLIGHT_PLAN';
export const REMOVE_FLIGHT_PLAN = 'REMOVE_FLIGHT_PLAN';
export const ERROR = 'flightPlans/ERROR';

import {
  requestByCallsign
} from '../lib/b2b';

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

    if(!callsign) {
      return Promise.reject('fetchFlight: Please select a callsign');
    }
    // Fetch from B2B
    return requestByCallsign(callsign)
      .then(resp => {
        let flightPlans = R.pathOr([], ['body', 'summaries'], resp);
        if(!R.isArrayLike(flightPlans)) {
          flightPlans = [flightPlans];
        }

        const withStatus = status => R.propEq('status', status);

        return R.pipe(
          R.map(R.propOr({}, 'lastValidFlightPlan')),
          R.reject(withStatus('BACKUP')),
          R.map(flightPlan => {
            const status = R.propOr('UNKNOWN', 'status', flightPlan);

            const ifplId = R.path(['id', 'id'], flightPlan);
            if(!ifplId) {
              return null;
            }

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

            return flight;
          }),
          R.reject(R.isNil),
          R.uniqBy(R.prop('ifplId')),
          R.map(f => {
            dispatch({
              type: ADD_FLIGHT_PLAN,
              ...f
            });
            return f;
          }),
        )(flightPlans);
      })
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

function errorAction(error) {
  return {
    type: ERROR,
    error,
  };
}
