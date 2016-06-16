import _ from 'lodash';

import d from 'debug';
const debug = d('4me.history.reducer');


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
      return _.take([
        actionToHistoryObject(action),
        ..._.reject(state, h => h.ifplId === _.get(action, 'payload.ifplId'))
      ], maxHistoryLen);
    case REMOVE_FLIGHT_FROM_HISTORY:
      return [
        ..._.reject(state, h => h.ifplId === _.get(action, 'payload.ifplId'))
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
    'pointProfile',
    'delay'
  ]);
}
