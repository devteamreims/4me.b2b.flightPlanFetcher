import R from 'ramda';
import {
  ADD_PROFILE,
} from '../actions/profiles';

import {
  INVALID_KEYS,
} from '../actions/flightKeys';

export const maxCacheSize = 1000;

export default function profilesReducer(state = {}, action) {
  switch(action.type) {
    case ADD_PROFILE: {
      const {
        ifplId,
        profile,
      } = action;

      if(!ifplId || R.isEmpty(profile)) {
        return state;
      }

      return insertKeysToState(state, action);
    }
    case INVALID_KEYS:{
      const { ifplId } = action;
      return R.dissoc(ifplId, state);
    }
  }

  return state;
}

function insertKeysToState(state, payload) {
  const ifplId = R.prop('ifplId', payload);
  const profile = R.prop('profile', payload);
  const when = R.prop('when', payload);

  const idsToKeep = R.pipe(
    R.sortBy(ifplId => state[ifplId].when),
    R.takeLast(maxCacheSize - 1),
  )(Object.keys(state));

  return {
    ...R.pick(idsToKeep, state),
    [ifplId]: {
      ...profile,
      when,
    },
  };
}
