import d from 'debug';
const debug = d('4me.socket.reducers');
import _ from 'lodash';
import merge from 'lodash/merge';

import {
  SOCKET_INITIALIZED,
  SOCKET_CLIENT_CONNECTED,
  SOCKET_CLIENT_DISCONNECTED,
} from '../actions/socket';

const defaultState = {
  initialized: false,
  clients: []
};

export default function reducer(state = defaultState, action) {
  switch(action.type) {
    case SOCKET_INITIALIZED:
      return merge({}, state, {initialized: true});
    case SOCKET_CLIENT_CONNECTED:
      return Object.assign({}, state, {
        clients: [
          {
            id: action.clientId,
            ip: action.ipAddress,
          },
          ...state.clients
        ]
      });
    case SOCKET_CLIENT_DISCONNECTED:
      return Object.assign({}, state, {
        clients: _.reject(state.clients, c => c.id === action.clientId)
      });
  }
  return state;
}
