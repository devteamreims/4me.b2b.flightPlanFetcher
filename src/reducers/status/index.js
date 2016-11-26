import _ from 'lodash';
import { combineReducers } from 'redux';

import autocomplete from './autocomplete';
import flightKeys from './flightKeys';
import flightPlanRequest from './flight-plan-request';

export default combineReducers({
  autocomplete,
  flightKeys,
  flightPlanRequest,
});
