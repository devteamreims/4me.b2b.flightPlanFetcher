import _ from 'lodash';

import {
  COMPLETE,
  ERROR,
} from '../../actions/autocomplete-cache';

const defaultState = {
  lastUpdated: Date.now(),
  status: 'normal',
  error: null
};

export default function autocomplete(state = defaultState, action) {
  switch(action.type) {
    case COMPLETE:
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
