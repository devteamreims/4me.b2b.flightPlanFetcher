import _ from 'lodash';

export const getRaw = (state) => _.get(state, 'socket');

export const getClients = (state) => _.get(getRaw(state), 'clients', []);
