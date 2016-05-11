import d from 'debug';
const debug = d('4me.actions.autocompleteCache');
import _ from 'lodash';

export const COMPLETE = 'autocompleteCache/COMPLETE';
export const ERROR = 'autocompleteCache/ERROR';

import {
  requestByTrafficVolume,
} from '../lib/b2b';

export function refreshAutocomplete(trafficVolume = 'LFERMS', options = {}) {
  return (dispatch, getState) => {
    return requestByTrafficVolume(trafficVolume, options)
      .then(flights => dispatch(completeAction(flights)))
      .catch(err => {
        debug(err);
        const { message = 'Unknown error' } = err;
        dispatch(errorAction(message));
      });
  };
}

function completeAction(flights = []) {
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
