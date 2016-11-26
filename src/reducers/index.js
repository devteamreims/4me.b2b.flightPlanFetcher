import {combineReducers} from 'redux';

import socketReducer from './socket';
import history from './history';
import autocomplete from './autocomplete';
import status from './status';
import flightKeys from './flightKeys';
import profiles from './profiles';


export default combineReducers({
  socket: socketReducer,
  history,
  autocomplete,
  flightKeys,
  profiles,
  status,
});
