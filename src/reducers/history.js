import _ from 'lodash';


import {
  ADD_FLIGHT_TO_HISTORY,
  REMOVE_FLIGHT_FROM_HISTORY
} from '../actions/history';

const defaultState = [];

/**
  State is an array of objects like this one :
  {
    ifplId: 'ATXXXXX',
    callsign: 'DLH500',
    departure: 'EDDF',
    destination: 'SBGL',
    eobt: Date.utc(),
    fetched: Date.now(),
    aircraftType: 'A319',
    pointProfile: []
    delay: 23
  }
*/

export default function historyReducer(state = defaultState, action) {
  const maxHistoryLen = parseInt(process.env.HISTORY_MAX_SIZE) || 30;
  switch(action.type) {
    case ADD_FLIGHT_TO_HISTORY:
      const ifplId = action.ifplId;
      return _.take([
        actionToHistoryObject(action),
        ..._.reject(state, h => h.ifplId === ifplId)
      ], maxHistoryLen);
    case REMOVE_FLIGHT_FROM_HISTORY:
      return [
        ..._.reject(state, h => h.ifplId === action.ifplId)
      ];
  }

  return state;
}

function actionToHistoryObject(action) {
  return _.pick(action.payload, [
    'ifplId',
    'callsign',
    'departure',
    'destination',
    'eobt',
    'fetched',
    'aircraftType',
    'delay',
  ]);
}
