import d from 'debug';
const debug = d('4me.actions.autocompleteCache');
import _ from 'lodash';
import R from 'ramda';

export const COMPLETE = 'autocompleteCache/COMPLETE';
export const ERROR = 'autocompleteCache/ERROR';

import {
  postToB2B,
} from '../lib/b2b';

import {
  query as buildQuery,
  parseResponse,
} from '../lib/b2b/flight/queryInAirspace';

import {
  opsLog,
} from '../logger';

export function refreshAutocomplete(airspace = 'LFEERMS', options = {}) {
  return (dispatch, getState) => {
    const body = buildQuery(airspace, options);

    return postToB2B({body})
      .then(parseResponse)
      .then(b2bResponse => {
        const processSingleFlight = R.pipe(
          // Extract stuff from raw B2B response
          R.path(['flight', 'flightId']),
          /**
           * Expected output shape :
           * "ifplId": "AA58790963",
           * "callsign": "EZY73BV",
           * "departure": "LSGG",
           * "destination": "EGCC",
           * "eobt": "2016-11-23 13:20"
           * More on applySpec here: http://ramdajs.com/docs/#applySpec
           */
          R.applySpec({
            ifplId: R.prop('id'),
            callsign: R.path(['keys', 'aircraftId']),
            departure: R.path(['keys', 'aerodromeOfDeparture']),
            destination: R.path(['keys', 'aerodromeOfDestination']),
            eobt: R.path(['keys', 'estimatedOffBlockTime']),
          }),
        );

        const flights = R.pipe(
          R.pathOr([], ['data', 'flights']),
          R.map(processSingleFlight),
        )(b2bResponse);

        dispatch(completeAction(flights));
      })
      .catch(err => {
        debug(err);
        const { message = 'Unknown error' } = err;
        dispatch(errorAction(message));
      });
  };
}

function completeAction(flights = []) {
  opsLog({flights, autocompleteRefresh: true}, "autocompleteRefresh");

  return {
    type: COMPLETE,
    flights,
  };
}

function errorAction(error) {
  return {
    type: ERROR,
    error,
  };
}
