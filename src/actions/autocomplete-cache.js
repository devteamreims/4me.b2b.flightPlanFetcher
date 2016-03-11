
export const SET = 'autocompleteCache/SET';

import {
  requestByTrafficVolume,
} from '../lib/b2b';

export function refreshAutocomplete(trafficVolume = 'LFERMS', options = {}) {
  return (dispatch, getState) => {
    return requestByTrafficVolume(trafficVolume, options)
      .then(flights => dispatch(setAction(flights)));
  };
}

function setAction(flights = []) {
  return {
    type: SET,
    flights,
  };
}
