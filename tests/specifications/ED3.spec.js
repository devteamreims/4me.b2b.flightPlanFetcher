import nock from 'nock';

import { requestByCallsign } from '../../src/lib/b2b';

test('discard invalid response', () => {
  const b2bRemote = nock(process.env.B2B_URL)
    .post('/')
    .reply(200, "invalid xml data");


  return requestByCallsign('AFR1234')
    .then(() => expect(true).toBe(false))
    .catch(err => {
      nock.cleanAll();
      expect(err.message).toMatch(/invalid data/i);
    });
});
