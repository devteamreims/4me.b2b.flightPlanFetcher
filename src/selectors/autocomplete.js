import R from 'ramda';

import {
  getKeysFromIfplId,
} from './flightKeys';

export const getRaw = R.propOr([], 'autocomplete');

export const getFlights = state => {
  const ids = getRaw(state);
  return R.map(ifplId => getKeysFromIfplId(ifplId)(state), ids);
}

export const getFromString = (string) => (state) => {
  if(!string) {
    return getFlights(state);
  }

  const regExp = new RegExp(string, 'i');

  return R.filter(
    R.propSatisfies(R.test(regExp), 'callsign'),
    getFlights(state),
  );
}
