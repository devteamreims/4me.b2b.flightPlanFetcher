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

const getIfplIdsFromCallsign = callsign => R.pipe(
  getKeys,
  R.filter(R.propEq('callsign', callsign)),
  R.keys,
);


export const getKeysFromCallsign = callsign => state => {
  const ifplIds = getIfplIdsFromCallsign(callsign)(state);
  return R.map(
    ifplId => getKeysFromIfplId(ifplId)(state)
  )(ifplIds);
};
