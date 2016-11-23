import {
  flightSoapEnvelope,
  airspaceServiceSoapEnvelope,
  B2BError,
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

describe('B2B Error', () => {
  test('should extend native Error', () => {
    const err = new B2BError('Test error !');
    expect(() => { throw err; }).toThrow();
    expect(err.message).toBe('Test error !');
  });

  test('should accept a b2bResponse metadata', () => {
    const err = new B2BError('Test error !', {b2bResponse: 'test'});
    expect(err.b2bResponse).toBe('test');
  });
});
