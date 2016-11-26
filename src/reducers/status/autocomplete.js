import _ from 'lodash';

import {
  MARK_FOR_AUTOCOMPLETE,
  ERROR,
} from '../../actions/autocomplete';

const defaultState = {
  lastUpdated: Date.now(),
  status: 'normal',
  error: null
};

export default function autocomplete(state = defaultState, action) {
  switch(action.type) {
    case MARK_FOR_AUTOCOMPLETE:
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
