import {createStore, applyMiddleware} from 'redux';

import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
import deepFreeze from 'redux-freeze';

import d from 'debug';
const debug = d('4me.redux');

import {initializeSocket} from './actions/socket';

import {
  refreshAutocomplete,
} from './actions/autocomplete';

import { installSubscriptions } from './subscriptions';


const AUTOCOMPLETE_REFRESH_INTERVAL = 1000*60*5; //  5 minutes

import reducers from './reducers';

import {getSocket} from './socket';

export default function makeStore(socketIo) {
  debug('Creating store');

  const logger = createLogger({
    logger: {
      log: d('4me.redux.logger'),
    },
    colors: {}
  });

  const store = createStore(reducers, applyMiddleware(thunk, deepFreeze, logger));

  // Initialize socketIo
  store.dispatch(initializeSocket(socketIo));

  const refreshCache = () => store.dispatch(refreshAutocomplete('LFEERMS'));

  setInterval(refreshCache, AUTOCOMPLETE_REFRESH_INTERVAL);

  refreshCache();

  installSubscriptions(store);

  return store;
}
