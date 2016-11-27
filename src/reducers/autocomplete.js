import R from 'ramda';

import {
  MARK_FOR_AUTOCOMPLETE,
  ERROR,
} from '../actions/autocomplete';

import {
  INVALID_KEYS,
} from '../actions/flightKeys';

export default function autocompleteReducer(state = [], action) {
  switch(action.type) {
    case MARK_FOR_AUTOCOMPLETE: {
      const { ifplIds } = action;
      return [ ...ifplIds ];
    }
    case INVALID_KEYS: {
      const { ifplId } = action;
      return R.without([ifplId], state);
    }
    case ERROR: {
      return [];
    }
  }
  return state;
}
