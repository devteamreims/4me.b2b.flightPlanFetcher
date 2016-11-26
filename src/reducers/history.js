import R from 'ramda';

import {
  MARK_FOR_HISTORY,
} from '../actions/history';

import {
  INVALID_KEYS,
} from '../actions/flightKeys';

export const maxHistoryLen = 30;

export default function historyReducer(state = [], action) {
  switch(action.type) {
    case MARK_FOR_HISTORY: {
      const { ifplId } = action;

      return R.pipe(
        R.without([ifplId]),
        R.concat([ifplId]),
        R.take(maxHistoryLen),
      )(state);
    }
    case INVALID_KEYS: {
      const { ifplId } = action;
      return R.reject(R.equals(ifplId), state);
    }
  }

  return state;
}
