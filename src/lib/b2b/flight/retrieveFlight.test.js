import {
  retrieveByIfplId,
  retrieveByKeys,
  parseResponse,
} from './retrieveFlight';

import {
  exampleResponse,
  notFoundResponse,
  invalidInputResponse,
} from './retrieveFlight.responses';

import MockDate from 'mockdate';

describe('retrieveFlight', () => {
  // Our query build depends on the current time
  // MockDate allows snapshot testing by overriding global Date class
  beforeEach(() => {
    MockDate.set(1479898355004);
  });

  afterEach(() => {
    MockDate.reset();
  });

  describe('byIfplId builder', () => {
    test('should accept valid arguments', () => {
      expect(() => retrieveByIfplId('string')).not.toThrow();
      expect(() => retrieveByIfplId('string', {})).not.toThrow();
    });

    test('should reject invalid arguments', () => {
      expect(() => retrieveByIfplId({})).toThrowErrorMatchingSnapshot();
      expect(() => retrieveByIfplId(null)).toThrowErrorMatchingSnapshot();
      expect(() => retrieveByIfplId('string', 'string')).toThrowErrorMatchingSnapshot();
    });

    test('should accept an airspace as argument', () => {
      expect(retrieveByIfplId('AA123456789')).toMatch(/AA123456789/);
    });

    test('should match snapshot', () => {
      expect(retrieveByIfplId('AA123456789')).toMatchSnapshot();
    });
  });

  describe('byKeys builder', () => {
    const validEobt = '2016-11-23 16:00';

    test('should accept valid arguments', () => {
      expect(() => retrieveByKeys('string', 'string', 'string', validEobt)).not.toThrow();
      expect(() => retrieveByKeys('string', 'string', 'string', validEobt, {})).not.toThrow();
    });

    test('should reject invalid arguments', () => {
      expect(() => retrieveByKeys({})).toThrowErrorMatchingSnapshot();
      expect(() => retrieveByKeys(null)).toThrowErrorMatchingSnapshot();
      expect(() => retrieveByKeys(null, null, null, null, {})).toThrowErrorMatchingSnapshot();
      expect(() => retrieveByKeys('string', 'string', 'string', 'string', 'string')).toThrowErrorMatchingSnapshot();
    });

    test('should generate a proper query', () => {
      const validKeys1 = {
        callsign: 'AFR1234',
        dep: 'LFPG',
        dest: 'LIPZ',
        eobt: validEobt,
      };

      expect(
        retrieveByKeys(
          validKeys1.callsign,
          validKeys1.dep,
          validKeys1.dest,
          validKeys1.eobt,
        )
      ).toMatchSnapshot();
    });

  });

  describe('response parser', () => {
    test('should parse correct response', () => {
      return parseResponse(exampleResponse).then(
        parsedResponse => expect(parsedResponse).toMatchSnapshot(),
        () => expect(false).toBe(true),
      );
    });

    test('should handle not found response', () => {
      return parseResponse(notFoundResponse).then(
        () => expect(false).toBe(true),
        error => {
          expect(error.name).toBe('B2BErrorNotFound');
        }
      );
    });

    test('should handle invalid_input response', () => {
      return parseResponse(invalidInputResponse).then(
        () => expect(false).toBe(true),
        error => {
          expect(error.name).toBe('B2BError');
        }
      );
    });


  });
});
