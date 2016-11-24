import {
  flightSoapEnvelope,
  airspaceServiceSoapEnvelope,
  B2BError,
  B2BErrorNotFound,
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

describe('B2BError', () => {
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

describe('B2BErrorNotFound', () => {
  test('should extend native Error', () => {
    const err = new B2BErrorNotFound();
    expect(() => { throw err; }).toThrow();
    expect(err.message).toMatch(/not found/i);
  });

  test('should accept a b2bResponse metadata', () => {
    const err = new B2BErrorNotFound({b2bResponse: 'test'});
    expect(err.b2bResponse).toBe('test');
  });
});
