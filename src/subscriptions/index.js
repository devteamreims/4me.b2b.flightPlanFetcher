import announceNewHistoryToSockets from './socketHistory';

let oldState;

export function installSubscriptions(store) {
  oldState = store.getState();

  store.subscribe(() => {
    announceNewHistoryToSockets(oldState, store.getState());
    oldState = store.getState();
  });
}
