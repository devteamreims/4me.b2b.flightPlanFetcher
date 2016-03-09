import _ from 'lodash';


export const getFlightPlans = (state) => _.get(state, 'flightPlans', []);

export const getKeysFromIfplId = (ifplId) => (state) => _.find(getFlightPlans(state), f => f.ifplId === ifplId) || {};