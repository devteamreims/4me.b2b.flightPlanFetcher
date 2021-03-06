import R from 'ramda';
import invariant from 'invariant';


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
