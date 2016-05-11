import {
  COMPLETE,
  ERROR,
} from '../actions/autocomplete-cache';

import _ from 'lodash';

const initialState = {
  lastUpdated: null,
  flights: [],
};

export default function autocompleteCacheReducer(state = initialState, action) {
  switch(action.type) {
    case COMPLETE:
      return Object.assign({}, state, {
        lastUpdated: Date.now(),
        flights: [
          ...action.flights
        ],
      });
    case ERROR:
      return Object.assign({}, state, {
        lastUpdated: Date.now(),
        flights: [],
      });
  }
  return state;
}
