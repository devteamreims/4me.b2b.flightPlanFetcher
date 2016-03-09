import d from 'debug';
const debug = d('4me.socket');
import _ from 'lodash';

import {
  clientConnected,
  clientDisconnected
} from '../actions/socket';


let mySocket;

// Global socketIo object event handler
export function setupSocketIo(dispatch, socketIo) {
  debug('Initializing socket.io');

  mySocket = socketIo;

  socketIo.on('connect', function(socket) {
    debug('client connected');
    dispatch(clientConnected(socket.id));
    attachHandlerToSocket(dispatch, socket);
  });

  return mySocket;
}


export function getSocket() {
  return mySocket;
}

// Per client socket event handler
export function attachHandlerToSocket(dispatch, socket) {
  debug('Attaching socket handlers to client with id : %s', socket.id);
  socket.on('disconnect', () => dispatch(clientDisconnected(socket.id)));
}

export function broadcastUpdateHistory(socket) {
  socket.emit('update_history');
}