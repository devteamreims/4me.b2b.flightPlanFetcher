import d from 'debug';
const debug = d('4me.socket.actions');
import _ from 'lodash';
import merge from 'lodash/merge';


// Socket clients management (connect/disconnect)
export const SOCKET_INITIALIZED = 'SOCKET_INITIALIZED';
export const SOCKET_CLIENT_CONNECTED = 'SOCKET_CLIENT_CONNECTED';
export const SOCKET_CLIENT_DISCONNECTED = 'SOCKET_CLIENT_DISCONNECTED';

import {setupSocketIo} from '../socket';


export function initializeSocket(socketIo) {
  return (dispatch, getState) => {
    setupSocketIo(dispatch, socketIo);
    dispatch(socketInitialized());
  }
}

function socketInitialized() {
  return {
    type: SOCKET_INITIALIZED
  }
}

export function clientConnected(clientId) {
  return {
    type: SOCKET_CLIENT_CONNECTED,
    clientId: clientId
  };
}

export function clientDisconnected(clientId) {
  return {
    type: SOCKET_CLIENT_DISCONNECTED,
    clientId: clientId
  };
}
