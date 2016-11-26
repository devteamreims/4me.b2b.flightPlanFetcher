import _ from 'lodash';
import R from 'ramda';
import d from 'debug';
const debug = d('4me.history.actions');
import invariant from 'invariant';

import moment from 'moment';

import {
  opsLog,
} from '../logger';

// opsLog({ifplId, result: fromHistory, forceRefresh, fetchProfile: true}, "fetchProfile");

// opsLog({ifplId, result: formattedProfile, forceRefresh, fetchProfile: true}, "fetchProfile");


export const MARK_FOR_HISTORY = 'history/MARK_FOR_HISTORY';

export function markForHistory(ifplId) {
  invariant(
    ifplId && typeof ifplId === 'string',
    'Argument error: ifplId must be a string',
  );

  return {
    type: MARK_FOR_HISTORY,
    ifplId,
  };
}
