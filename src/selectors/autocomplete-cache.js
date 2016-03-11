import _ from 'lodash';


export const getRaw = (state) => _.get(state, 'autocompleteCache', {});

export const getLastUpdated = (state) => _.get(getRaw(state), 'lastUpdated');

export const getFlights = (state) => _.get(getRaw(state), 'flights', []);

export const getFromString = (string) => (state) => {
  if(!string) {
    return getFlights(state);
  }

  const regExp = new RegExp(string, 'i');

  return _(getFlights(state))
    .filter(f => _.get(f, 'callsign', '').match(regExp))
    .value();
}
