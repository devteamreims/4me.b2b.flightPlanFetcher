import _ from 'lodash';

import {
  ADD_PROFILE,
  ERROR,
} from '../../actions/profiles';

const defaultState = {
  lastUpdated: Date.now(),
  status: 'normal',
  error: null
};

export default function flightPlanRequest(state = defaultState, action) {
  switch(action.type) {
    case ADD_PROFILE:
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
