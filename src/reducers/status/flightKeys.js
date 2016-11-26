import _ from 'lodash';

import {
  ADD_KEYS,
  ERROR,
} from '../../actions/flightKeys';

const defaultState = {
  lastUpdated: Date.now(),
  status: 'normal',
  error: null
};

export default function flightRequest(state = defaultState, action) {
  switch(action.type) {
    case ADD_KEYS:
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
