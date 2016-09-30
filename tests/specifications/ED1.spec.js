import nock from 'nock';

import { requestByCallsign } from '../../src/lib/b2b';

test('have a request timeout', () => {

  process.env.B2B_MAX_REQUEST_TIME = 300;

  //const {requestByCallsign} = require('../../src/lib/b2b');

  const b2bRemote = nock(process.env.B2B_URL)
    .post('/')
    .delay(1000)
    .reply(500, 'mock data');


  return requestByCallsign('AFR1234')
    .then(() => expect(true).toBe(false))
    .catch(err => {
      delete process.env.B2B_MAX_REQUEST_TIME;
      nock.cleanAll();
      expect(err.message).toMatch(/ETIMEDOUT/);
    });
});
