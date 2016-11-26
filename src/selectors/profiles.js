import {
  getKeysFromIfplId
} from './flightKeys';

import R from 'ramda';

const getProfiles = R.prop('profiles');

const getProfileFromIfplId = ifplId => R.pipe(
  getProfiles,
  R.propOr(null, ifplId),
  R.unless(
    R.isNil,
    R.assoc('ifplId', ifplId),
  ),
);

export const getFromIfplId = ifplId => state => {
  const keys = getKeysFromIfplId(ifplId)(state);
  if(!keys) {
    return null;
  }

  const profile = getProfileFromIfplId(ifplId)(state);
  if(!profile) {
    return null;
  }

  return {
    ...keys,
    ...profile,
  };
};
