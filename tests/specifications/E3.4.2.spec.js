import {addToHistory} from '../../src/actions/history';
import historyReducer from '../../src/reducers/history';
import _ from 'lodash';
import fp from 'lodash/fp';

import uuid from 'node-uuid';

// This will generate a random history entry
const generateHistoryPayload = () => ({
  ifplId: uuid.v4(),
});

test('E3.4.2 : limit local cache size', () => {
  //const store = rootReducer();
  const HISTORY_HARD_LIMIT = parseInt(process.env.HISTORY_HARD_LIMIT, 10);
  const times = HISTORY_HARD_LIMIT + 30; // Add 30 items to HISTORY_HARD_LIMIT
  const actions = _.times(times, () => addToHistory(generateHistoryPayload()));

  const state = fp.reduce(historyReducer, {}, actions);
  expect(_.size(state)).toBe(HISTORY_HARD_LIMIT);

});
