import _ from 'lodash';

import {
  ADD_FLIGHT_TO_HISTORY,
  ERROR,
} from '../../actions/history';

const defaultState = {
  lastUpdated: Date.now(),
  status: 'normal',
  error: null
};

export default function flightPlanRequest(state = defaultState, action) {
  switch(action.type) {
    case ADD_FLIGHT_TO_HISTORY:
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
