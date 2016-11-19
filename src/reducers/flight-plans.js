import {
  ADD_FLIGHT_PLAN,
  REMOVE_FLIGHT_PLAN
} from '../actions/flight-plans';

import _ from 'lodash';

const initialState = [];

export default function flightPlansReducer(state = initialState, action) {
  switch(action.type) {
    case ADD_FLIGHT_PLAN:
      return [
        actionToObject(action),
        ..._.reject(state, s => s.ifplId === action.ifplId)
      ];
    case REMOVE_FLIGHT_PLAN:
      return _.reject(state, s => s.ifplId === action.ifplId);
  }
  return state;
}

export function actionToObject(action) {
  return _.pick(action, [
    'ifplId',
    'callsign',
    'departure',
    'destination',
    'eobt',
    'fetched',
    'status',
  ]);
}
