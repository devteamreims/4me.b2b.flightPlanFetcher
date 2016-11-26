import R from 'ramda';
import MockDate from 'mockdate';

import {
  markForAutocomplete,
} from '../actions/autocomplete';

import {
  invalidIfplId,
} from '../actions/flightKeys';

import reducer from './autocomplete';



describe('autocomplete', () => {
  describe('markForAutocomplete', () => {
    test('should reject invalid arguments', () => {
      expect(() => markForAutocomplete()).toThrowError(/argument/i);
      expect(() => markForAutocomplete({})).toThrowError(/argument/i);
      expect(() => markForAutocomplete({a: 'test'})).toThrowError(/argument/i);
      expect(() => markForAutocomplete('string')).toThrowError(/argument/i);
      expect(() => markForAutocomplete([{}, 2])).toThrowError(/argument/i);
    });

    test('should accept valid ifplIds list', () => {
      expect(() => markForAutocomplete(['ifplId1', 'iplfId2'])).not.toThrow();
    });
  });
  describe('reducer', () => {
    test('should have an initial state', () => {
      expect(reducer(undefined, {type: '@@INIT'})).toEqual([]);
    });

    test('should mark specific keys are part of the autocomplete list', () => {
      const ifplIds = ['AA0', 'AA1', 'AA2'];
      const action = markForAutocomplete(ifplIds);
      expect(reducer(undefined, action)).toMatchSnapshot();
    });

    test('should discard old ifplIds marked for autocomplete', () => {
      const ifplIds = ['AA0', 'AA1', 'AA2'];
      let state;
      state = reducer(state, markForAutocomplete(ifplIds));
      state = reducer(state, markForAutocomplete(['AA1', 'AA3']));
      expect(state).toMatchSnapshot();
    });

    test('should remove keys when invalidated', () => {
      const ifplIds = ['AA0', 'AA1', 'AA2'];
      let state;
      state = reducer(state, markForAutocomplete(ifplIds));
      state = reducer(state, invalidIfplId('AA2'));
      expect(state).not.toContain('AA2');
    });
  });
});
