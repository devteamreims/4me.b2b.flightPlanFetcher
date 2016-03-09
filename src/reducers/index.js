import {combineReducers} from 'redux';

import socketReducer from './socket';
import historyReducer from './history';
import flightPlansReducer from './flight-plans';

export default combineReducers({
  socket: socketReducer,
  history: historyReducer,
  flightPlans: flightPlansReducer
});