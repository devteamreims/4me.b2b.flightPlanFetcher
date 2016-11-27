import R from 'ramda';
import MockDate from 'mockdate';
import moment from 'moment';

import {
  addKeys,
  addBulkKeys,
  invalidIfplId,
} from '../actions/flightKeys';

import reducer, { maxCacheSize } from './flightKeys';

const validKeys = {
  ifplId: 'AA123456789',
  callsign: 'AFR1234',
  departure: 'LFPG',
  destination: 'LIPZ',
  eobt: '2016-11-23 21:00',
  status: 'AIRBORNE',
};

const validKeys2 = {
  ifplId: 'AA987654321',
  callsign: 'AFR1234',
  departure: 'LFPG',
  destination: 'LIPZ',
  eobt: '2016-11-23 21:00',
  status: 'AIRBORNE',
};

describe('flightKeys', () => {
  describe('addBulkKeys', () => {
    test('should reject invalid arguments', () => {
      expect(() =>
        addBulkKeys()
      ).toThrowError(/argument/i);

      expect(() =>
        addBulkKeys({})
      ).toThrowError(/argument/i);

      expect(() =>
        addBulkKeys('string')
      ).toThrowError(/argument/i);

      expect(() =>
        addBulkKeys(['a'])
      ).toThrowError(/argument/i);

      expect(() =>
        addBulkKeys([validKeys, 'a'])
      ).toThrowError(/argument/i);
    });

    test('should accept valid keys', () => {
      expect(() => addBulkKeys([validKeys])).not.toThrow();
      const action = addBulkKeys([validKeys]);
      expect(action.when).toBeDefined();
      expect(action.when).toBeInstanceOf(Date);
      expect(R.dissoc('when', action)).toMatchSnapshot();
    });
  });

  describe('addKeys', () => {
    test('should reject invalid arguments', () => {
      expect(() =>
        addKeys()
      ).toThrowError(/argument/i);

      expect(() =>
        addKeys({ifplId: 'str'})
      ).toThrowError(/argument/i);

      expect(() =>
        addKeys({
          ifplId: 'str',
          departure: 'str',
        })
      ).toThrowError(/argument/i);

      expect(() =>
        addKeys({
          ifplId: 'str',
          departure: 'str',
          destination: 'str',
        })
      ).toThrowError(/argument/i);

      expect(() =>
        addKeys({
          ifplId: 'str',
          departure: 'str',
          destination: 'str',
          eobt: 'str',
        })
      ).toThrowError(/argument/i);

      expect(() =>
        addKeys({
          ifplId: 'str',
          departure: 'str',
          destination: 'str',
          eobt: 'str',
          status: 123,
        })
      ).toThrowError(/argument/i);
    });

    test('should accept valid keys', () => {
      expect(() => addKeys(validKeys)).not.toThrow();
      const action = addKeys(validKeys);
      expect(action.when).toBeInstanceOf(Date);
      expect(R.dissoc('when', action)).toMatchSnapshot();
    });
  });

  describe('invalidIfplId', () => {
    test('should reject invalid arguments', () => {
      expect(() => invalidIfplId()).toThrowError(/argument/i);
      expect(() => invalidIfplId(3)).toThrowError(/argument/i);
      expect(() => invalidIfplId({})).toThrowError(/argument/i);
    });

    test('should accept valid ifplId as argument', () => {
      expect(() => invalidIfplId('AA123')).not.toThrow();
    });
  });

  describe('reducer', () => {
    beforeEach(() => {
      MockDate.set(1479898355004);
    });

    afterEach(() => {
      MockDate.reset();
    });

    test('should provide an empty state', () => {
      expect(reducer(undefined, {type: '@@INIT'})).toEqual({});
    });

    test('should add keys to the store', () => {
      const action = addKeys(validKeys);
      expect(reducer({}, action)).toMatchSnapshot();
    });

    test('should replace keys with the same ifplId', () => {
      const action = addKeys(validKeys);
      const state = reducer({}, action);
      expect(reducer(state, action)).toMatchSnapshot();
    });

    test('should add keys for multiple ifplIds', () => {
      const state = reducer({}, addKeys(validKeys));
      expect(reducer(state, addKeys(validKeys2))).toMatchSnapshot();
    });

    const getKeys = i => ({
      ...validKeys,
      ifplId: `AA${i}`,
    });

    test('should have a maximum cache size', () => {
      let state = {};

      for(let i = 0; i < maxCacheSize + 1; i++) {
        const keys = getKeys(i);
        state = reducer(state, addKeys(keys));
      }

      expect(Object.keys(state).length).toBe(maxCacheSize);
    });

    test('should remove old items from cache', () => {
      let state = {};

      for(let i = 0; i < maxCacheSize + 1; i++) {
        const keys = getKeys(i);
        MockDate.set(1479898355004 + i * 1000);
        state = reducer(state, addKeys(keys));
      }

      expect(Object.keys(state)).not.toContain('AA0');
    });

    describe('bulk key insertion', () => {
      test('should handle bulk keys', () => {
        const action = addBulkKeys([validKeys, validKeys2]);
        expect(reducer({}, action)).toMatchSnapshot();
      });
    });

    test('should remove keys when invalidated', () => {
      let state = {};
      const action = addBulkKeys([validKeys, validKeys2]);
      state = reducer(state, action);
      expect(Object.keys(state).length).toBe(2);
      state = reducer(state, invalidIfplId(validKeys.ifplId));
      expect(Object.keys(state)).not.toContain(validKeys.ifplId);
    });
  });
});
