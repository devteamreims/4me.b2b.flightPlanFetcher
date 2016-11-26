import R from 'ramda';


const getKeys = R.propOr({}, 'flightKeys');

export const getKeysFromIfplId = ifplId => R.pipe(
  getKeys,
  R.propOr(null, ifplId),
  R.unless(
    R.isNil,
    R.assoc('ifplId', ifplId),
  ),
);

const getIfplIdFromCallsign = callsign => R.pipe(
  getKeys,
  R.filter(R.propEq('callsign', callsign)),
  R.keys,
  R.head,
);


export const getKeysFromCallsign = callsign => state => {
  const ifplId = getIfplIdFromCallsign(callsign)(state);
  return getKeysFromIfplId(ifplId)(state);
};
