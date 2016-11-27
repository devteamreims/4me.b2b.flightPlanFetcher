import { markForHistory } from '../../src/actions/history';
import historyReducer, { maxHistoryLen } from '../../src/reducers/history';
import _ from 'lodash';
import fp from 'lodash/fp';

import uuid from 'node-uuid';

// This will generate a random history entry
const generateRandomIfplId = () => uuid.v4();

test('E3.4.2 : limit local cache size', () => {
  const actions = _.times(maxHistoryLen + 10, () => markForHistory(generateRandomIfplId()));

  const state = fp.reduce(historyReducer, undefined, actions);
  expect(state.length).toBe(maxHistoryLen);

});
