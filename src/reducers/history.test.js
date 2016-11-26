import R from 'ramda';
import MockDate from 'mockdate';

import {
  markForHistory,
} from '../actions/history';

import {
  invalidIfplId,
} from '../actions/flightKeys';

import reducer, { maxHistoryLen } from './history';

describe('history', () => {
  describe('markForHistory', () => {
    test('should reject invalid arguments', () => {
      expect(() => markForHistory()).toThrowError(/argument/i);
      expect(() => markForHistory({})).toThrowError(/argument/i);
      expect(() => markForHistory({a: 'test'})).toThrowError(/argument/i);
      expect(() => markForHistory([{}, 2])).toThrowError(/argument/i);
    });

    test('should accept valid ifplIds list', () => {
      expect(() => markForHistory('ifplId1')).not.toThrow();
    });
  });
  describe('reducer', () => {
    test('should have an initial state', () => {
      expect(reducer(undefined, {type: '@@INIT'})).toEqual([]);
    });

    test('should mark specific keys are part of the history list', () => {
      const action = markForHistory('AA0');
      expect(reducer(undefined, action)).toMatchSnapshot();
    });

    test('should have a maximum size', () => {
      const getIfplId = i => `AA${i}`;

      let state = [];
      for(let i = 0; i < maxHistoryLen + 1; i++) {
        const ifplId = getIfplId(i);
        state = reducer(state, markForHistory(ifplId));
      }

      expect(state).not.toContain('AA0');
    });

    test('should remove keys when invalidated', () => {
      let state = ['AA0', 'AA1', 'AA2'];
      state = reducer(state, invalidIfplId('AA2'));
      expect(state).not.toContain('AA2');
    });
  });
});
