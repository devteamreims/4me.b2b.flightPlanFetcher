import R from 'ramda';

import { getFromIfplId } from './profiles';

export const getHistory = R.prop('history');
export const getProfilesInHistory = state => {
  const ifplIdsInHistory = getHistory(state);

  return R.map(
    ifplId => getFromIfplId(ifplId)(state)
  )(ifplIdsInHistory);
};
