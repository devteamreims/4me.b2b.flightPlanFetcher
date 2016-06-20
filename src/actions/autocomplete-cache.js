import d from 'debug';
const debug = d('4me.actions.autocompleteCache');
import _ from 'lodash';

export const COMPLETE = 'autocompleteCache/COMPLETE';
export const ERROR = 'autocompleteCache/ERROR';

import {
  requestByTrafficVolume,
  requestByAirspace,
} from '../lib/b2b';

import {
  opsLog,
} from '../logger';

export function refreshAutocomplete(trafficVolume = 'LFERMS', options = {}) {
  return (dispatch, getState) => {
    return requestByAirspace('LFEERMS', options)
      .then(flights => dispatch(completeAction(flights)))
      .catch(err => {
        debug(err);
        const { message = 'Unknown error' } = err;
        dispatch(errorAction(message));
      });
  };
}

function completeAction(flights = []) {

  opsLog({flights}, {autocompleteRefresh: true});

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
