import R from 'ramda';

import { getFromIfplId } from './profiles';

export const getHistory = R.prop('history');
export const getProfilesInHistory = state => {
  const ifplIdsInHistory = getHistory(state);

  return R.pipe(
    R.map(ifplId => getFromIfplId(ifplId)(state)),
    R.reject(R.isNil),
  )(ifplIdsInHistory);
};
