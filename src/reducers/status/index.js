import _ from 'lodash';
import { combineReducers } from 'redux';

import autocomplete from './autocomplete';
import flightKeys from './flightKeys';
import profiles from './profiles';

export default combineReducers({
  autocomplete,
  flightKeys,
  profiles,
});
