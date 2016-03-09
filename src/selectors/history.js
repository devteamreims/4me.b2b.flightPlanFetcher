import _ from 'lodash';

export const getHistory = (state) => _.get(state, 'history');

export const getFromIfplId = (ifplId) => (state) => _.find(getHistory(state), h => h.ifplId === ifplId) || {};