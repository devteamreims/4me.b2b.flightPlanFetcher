import _ from 'lodash';
import { combineReducers } from 'redux';

import autocomplete from './autocomplete';
import flightRequest from './flight-request';
import flightPlanRequest from './flight-plan-request';

export default combineReducers({
  autocomplete,
  flightRequest,
  flightPlanRequest,
});
