import d from 'debug';
const debug = d('4me.actions.autocompleteCache');

import R from 'ramda';

import invariant from 'invariant';

export const ERROR = 'autocompleteCache/ERROR';
export const MARK_FOR_AUTOCOMPLETE = 'autocomplete/MARK_FOR_AUTOCOMPLETE';

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

import {
  addBulkKeys,
} from './flightKeys';

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
           * "status": "AIRBORNE"
           * More on applySpec here: http://ramdajs.com/docs/#applySpec
           */
          R.applySpec({
            ifplId: R.prop('id'),
            callsign: R.path(['keys', 'aircraftId']),
            departure: R.path(['keys', 'aerodromeOfDeparture']),
            destination: R.path(['keys', 'aerodromeOfDestination']),
            eobt: R.path(['keys', 'estimatedOffBlockTime']),
          }),
          R.assoc('status', 'AIRBORNE'),
        );

        const flights = R.pipe(
          R.pathOr([], ['data', 'flights']),
          R.map(processSingleFlight),
          R.tap(flights => dispatch(addBulkKeys(flights))),
        )(b2bResponse);

        const ifplIds = R.map(R.prop('ifplId'), flights);
        dispatch(markForAutocomplete(ifplIds));

        return flights;
      })
      .then(flights => opsLog({flights, autocompleteRefresh: true}, "autocompleteRefresh"))
      .catch(err => {
        debug(err);
        const { message = 'Unknown error' } = err;
        dispatch(errorAction(message));
      });
  };
}

export function markForAutocomplete(ifplIds = []) {
  const isArrayOfStrings = R.all(R.is(String));

  invariant(
    ifplIds &&
    R.isArrayLike(ifplIds) &&
    !R.isEmpty(ifplIds) &&
    isArrayOfStrings(ifplIds),
    'Argument error: ifplIds must be an array of ifplIds',
  );

  return {
    type: MARK_FOR_AUTOCOMPLETE,
    ifplIds,
  }
}

function errorAction(error) {
  return {
    type: ERROR,
    error,
  };
}
