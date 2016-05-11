import {combineReducers} from 'redux';

import socketReducer from './socket';
import historyReducer from './history';
import flightPlansReducer from './flight-plans';
import autocompleteCacheReducer from './autocomplete-cache';
import status from './status';

export default combineReducers({
  socket: socketReducer,
  history: historyReducer,
  flightPlans: flightPlansReducer,
  autocompleteCache: autocompleteCacheReducer,
  status,
});
