import request from 'supertest';
import nock from 'nock';
import _ from 'lodash';

test('E4.2.3 : must raise error to clients in case of a b2b request error', () => {
  const app = require('../../index').default;

  // Here we mock the refresh autocomplete behaviour
  jest.mock('../../src/actions/autocomplete-cache', () => {
    return {
      refreshAutocomplete: () => ({type: 'MOCK_ACTION'}),
    };
  });

  const b2bRemote = nock(process.env.B2B_URL)
    .post('/')
    .reply(200, "invalid xml data");

  const r = request(app);

  const checkReply = () => r.get('/searchFlights?callsign=AFR12345')
    .expect(500)
    .expect(res => {
      expect(res.body.message).toMatch(/invalid data/i);
    });

  const checkStatus = () => r.get('/status')
    .expect(200)
    .expect(res => {
      const flightRequest = _.get(res, 'body.flightRequestStatus');

      expect(flightRequest.error).toBeTruthy();
      expect(flightRequest.error).toMatch(/invalid data/i);
    });

  return Promise.resolve()
    .then(checkReply)
    .then(checkStatus)
    .then(() => jest.resetModules());
});

