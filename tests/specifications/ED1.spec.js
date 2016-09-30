import nock from 'nock';

import { requestByCallsign } from '../../src/lib/b2b';

test('have a request timeout', () => {
  const b2bRemote = nock(process.env.B2B_URL)
    .post('/')
    .delay(1000)
    .reply(200, 'mock data');

  process.env.B2B_MAX_REQUEST_TIME = 300;

  return requestByCallsign('AFR1234')
    .then(() => expect(true).toBe(false))
    .catch(err => {
      expect(b2bRemote.isDone()).toBe(true);
      delete process.env.B2B_MAX_REQUEST_TIME;
      expect(err.message).toMatch(/ETIMEDOUT/);
    });
});


