import {
  flightSoapEnvelope,
  airspaceServiceSoapEnvelope,
} from './utils';

describe('b2b envelopes', () => {
  describe('flightService', () => {
    test('should check arguments', () => {
      expect(() => flightSoapEnvelope()).toThrowErrorMatchingSnapshot();
      expect(() => flightSoapEnvelope({id: 1})).toThrowErrorMatchingSnapshot();
    });

    test('should match snapshot', () => {
      expect(flightSoapEnvelope('payload')).toMatchSnapshot();
    });
  });

  describe('airspaceService', () => {
    test('should check arguments', () => {
      expect(() => airspaceServiceSoapEnvelope()).toThrowErrorMatchingSnapshot();
      expect(() => airspaceServiceSoapEnvelope({id: 1})).toThrowErrorMatchingSnapshot();
    });

    test('should match snapshot', () => {
      expect(airspaceServiceSoapEnvelope('payload')).toMatchSnapshot();
    });
  });
});
