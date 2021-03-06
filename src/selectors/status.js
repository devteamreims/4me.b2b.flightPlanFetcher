import _ from 'lodash';

export const getRaw = (state) => _.get(state, 'status');

export const getAutocomplete = (state) => _.get(getRaw(state), 'autocomplete', {});
export const getFlightKeys = (state) => _.get(getRaw(state), 'flightKeys', {});
export const getFlightPlanRequest = (state) => _.get(getRaw(state), 'flightPlanRequest', {});
