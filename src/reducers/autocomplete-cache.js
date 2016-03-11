import {
  SET,
} from '../actions/autocomplete-cache';

import _ from 'lodash';

const initialState = {
  lastUpdated: null,
  flights: [],
};

export default function autocompleteCacheReducer(state = initialState, action) {
  switch(action.type) {
    case SET:
      return Object.assign({}, state, {
        lastUpdated: Date.now(),
        flights: [
          ...action.flights
        ],
      });
  }
  return state;
}
