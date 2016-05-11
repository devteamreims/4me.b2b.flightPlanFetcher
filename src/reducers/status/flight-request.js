import _ from 'lodash';

import {
  ADD_FLIGHT_PLAN,
  ERROR,
} from '../../actions/flight-plans';

const defaultState = {
  lastUpdated: Date.now(),
  status: 'normal',
  error: null
};

export default function flightRequest(state = defaultState, action) {
  switch(action.type) {
    case ADD_FLIGHT_PLAN:
      return Object.assign({}, defaultState, {
        lastUpdated: Date.now(),
      });
    case ERROR:
      const { error } = action;
      return Object.assign({}, state, {
        status: 'error',
        error,
        lastUpdated: Date.now(),
      });
  }

  return state;
}
