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
        let flightPlans = _.get(resp, 'body.summaries');
        if(!_.isArray(flightPlans)) {
          flightPlans = [flightPlans];
        }

        return _(flightPlans)
          .map(flightPlan => {
            debug(flightPlan);
            const fp = _.get(flightPlan, 'lastValidFlightPlanId');

            if(!fp) {
              return;
            }

            const ifplId = _.get(fp, 'id');
            const callsign = _.get(fp, 'keys.aircraftId');
            const departure = _.get(fp, 'keys.aerodromeOfDeparture', 'ZZZZ');
            const destination = _.get(fp, 'keys.aerodromeOfDestination', 'ZZZZ');
            const eobt = _.get(fp, 'keys.estimatedOffBlockTime');
            const fetched = moment.utc().format();

            const flight = {
              ifplId,
              callsign,
              departure,
              destination,
              eobt,
              fetched
            };

            return flight;
          })
          .compact()
          .uniqBy(f => f.ifplId)
          .map(f => {
            dispatch({type: ADD_FLIGHT_PLAN, ...f});
            return f;
          })
          .value();
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

    // Filter lastValidFlightPlanIds

    // Dispatch ADD_FLIGHT_PLAN with proper keys

    // Return thenable promise

  };
}

function errorAction(error) {
  return {
    type: ERROR,
    error,
  };
}
