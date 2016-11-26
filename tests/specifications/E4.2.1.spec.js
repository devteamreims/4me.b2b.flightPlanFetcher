import request from 'supertest';

describe('E4.2.1 : must integrate with 4ME Framework', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('has a /status route', () => {
    const app = require('../../index').default;

    return request(app)
      .get('/status')
      .expect(res => {
        expect(res.body.version).toBe(process.env.npm_package_version);
        expect(res.body.socketClients).toBeDefined();
        expect(res.body.autocompleteStatus).toBeDefined();
        expect(res.body.flightKeysStatus).toBeDefined();
        expect(res.body.flightPlanRequestStatus).toBeDefined();
      });
  });
});
