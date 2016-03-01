import {combineReducers} from 'redux';

import socketReducer from './socket';

export default combineReducers({
  socket: socketReducer
});