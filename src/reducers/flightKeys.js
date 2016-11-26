import R from 'ramda';

import {
  ADD_KEYS,
  ADD_BULK_KEYS,
  INVALID_KEYS,
} from '../actions/flightKeys';

export const maxCacheSize = 1000;

export default function flightKeysReducer(state = {}, action) {
  switch(action.type) {
    case ADD_KEYS: {
      const payload = extractPayloadFromADD_KEYS(action);
      return insertKeysToState(state, payload);
    }
    case ADD_BULK_KEYS: {
      const payloads = R.propOr([], 'keys', action);
      const when = R.prop('when', action);
      return R.pipe(
        // First, inject when to each item,
        R.map(R.assoc('when', when)),
        // Then build a new state using insertKeysToState
        R.reduce(insertKeysToState, state),
      )(payloads);
    }
    case INVALID_KEYS: {
      const { ifplId } = action;
      return R.dissoc(ifplId, state);
    }
  }
  return state;
}

function insertKeysToState(state, payload) {
  const ifplId = R.prop('ifplId', payload);
  const keys = R.dissoc('ifplId', payload);

  const idsToKeep = R.pipe(
    R.sortBy(ifplId => state[ifplId].when),
    R.takeLast(maxCacheSize - 1),
  )(Object.keys(state));

  return {
    ...R.pick(idsToKeep, state),
    [ifplId]: keys,
  };
}


function extractPayloadFromADD_KEYS(action) {
  return R.pick([
    'ifplId',
    'callsign',
    'departure',
    'destination',
    'eobt',
    'when',
    'status',
  ], action);
}
