import R from 'ramda';

import {
  getKeysFromIfplId,
  getKeysFromCallsign,
} from './flightKeys';

const testState = {
  flightKeys: {
    'AA123': {
      callsign: 'AFR1234',
    },
    'AA456': {
      callsign: 'AFR4321',
    },
  },
};

describe('flightKeys selectors', () => {
  describe('getByIfplId', () => {
    test('should return the keys for an existing ifplId', () => {
      expect(getKeysFromIfplId('AA123')(testState)).toBeDefined();
    });

    test('should return null for a non existing ifplId', () => {
      expect(getKeysFromIfplId('non-existent')(testState)).toBe(null);
    });

    test('should include ifplId in returned object', () => {
      const keys = getKeysFromIfplId('AA123')(testState);
      expect(keys.ifplId).toBe('AA123');
    });
  });

  describe('getByCallsign', () => {
    test('should return the keys for an existing callsign', () => {
      expect(getKeysFromCallsign('AFR1234')(testState)).toMatchSnapshot();
    });
  });
});
