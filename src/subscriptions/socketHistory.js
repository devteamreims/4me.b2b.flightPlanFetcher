import { getSocket } from '../socket';

import {
  getHistory,
  getProfilesInHistory,
} from '../selectors/history';

export default function announceNewHistoryToSockets(oldState, newState) {
  if(getHistory(oldState) !== getHistory(newState)) {
    const socket = getSocket();
    if(!socket || !socket.emit) {
      return;
    }
    socket.emit('update_history', getProfilesInHistory(newState));
  }
}
