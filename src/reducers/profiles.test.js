import R from 'ramda';
import MockDate from 'mockdate';
import moment from 'moment';

import {
  addProfile,
} from '../actions/profiles';

import {
  invalidIfplId,
} from '../actions/flightKeys';

import reducer, { maxCacheSize } from './profiles';

const validProfile = {
  ifplId: 'AA123456789',
  delay: 20,
  aircraftType: 'B772',
  pointProfile: [],
  airspaceProfile: [],
};

const validProfile2 = {
  ifplId: 'AA987654321',
  delay: 10,
  aircraftType: 'B772',
  pointProfile: [],
  airspaceProfile: [],
};

describe('profiles', () => {
  describe('addProfile', () => {
    test('should reject invalid arguments', () => {
      expect(() =>
        addProfile()
      ).toThrowError(/argument/i);

      expect(() =>
        addProfile({})
      ).toThrowError(/argument/i);

      expect(() =>
        addProfile('string', {})
      ).toThrowError(/argument/i);

      expect(() =>
        addProfile(['a'])
      ).toThrowError(/argument/i);

      expect(() =>
        addProfile(null, validProfile)
      ).toThrowError(/argument/i);
    });

    test('should accept valid ifplId and keys', () => {
      expect(() => addProfile('AA123', validProfile)).not.toThrow();
      const action = addProfile('AA123', validProfile);
      expect(action.when).toBeDefined();
      expect(action.when).toBeInstanceOf(Date);
      expect(R.dissoc('when', action)).toMatchSnapshot();
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

    test('should add profiles to the store', () => {
      const action = addProfile(validProfile.ifplId, R.dissoc('ifplId', validProfile));
      expect(reducer({}, action)).toMatchSnapshot();
    });

    test('should replace keys with the same ifplId', () => {
      const action = addProfile(validProfile.ifplId, R.dissoc('ifplId', validProfile));
      const state = reducer({}, action);
      expect(reducer(state, action)).toMatchSnapshot();
    });

    test('should add keys for multiple ifplIds', () => {
      const state = reducer({}, addProfile(validProfile.ifplId, R.dissoc('ifplId', validProfile)));
      expect(
        reducer(
          state,
          addProfile(validProfile2.ifplId, R.dissoc('ifplId', validProfile2))
        )
      ).toMatchSnapshot();
    });

    const getIfplId = i => `AA${i}`;

    test('should have a maximum cache size', () => {
      let state = {};

      for(let i = 0; i < maxCacheSize + 1; i++) {
        const ifplId = getIfplId(i);
        state = reducer(state, addProfile(ifplId, validProfile));
      }

      expect(Object.keys(state).length).toBe(maxCacheSize);
    });

    test('should remove old items from cache', () => {
      let state = {};

      for(let i = 0; i < maxCacheSize + 1; i++) {
        const ifplId = getIfplId(i);
        MockDate.set(1479898355004 + i * 1000);
        state = reducer(state, addProfile(ifplId, validProfile));
      }

      expect(Object.keys(state)).not.toContain('AA0');
    });

    test('should remove profiles when keys are removed', () => {
      let state = {};
      state = reducer(state, addProfile(validProfile2.ifplId, R.dissoc('ifplId', validProfile2)));
      state = reducer(state, addProfile(validProfile.ifplId, R.dissoc('ifplId', validProfile)));
      expect(Object.keys(state)).toContain('AA123456789');
      expect(Object.keys(state)).toContain('AA987654321');

      state = reducer(state, invalidIfplId('AA123456789'));
      expect(Object.keys(state)).not.toContain('AA123456789');
    });
  });
});
