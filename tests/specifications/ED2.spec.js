import nock from 'nock';

import { requestByCallsign } from '../../src/lib/b2b';

test('have a maximum allowed size for server response', () => {
  const b2bRemote = nock(process.env.B2B_URL)
    .defaultReplyHeaders({
      'Content-Length': 1024*1024*1024*2, // 2 GB
    })
    .post('/')
    .reply(200, "test data");

  process.env.B2B_MAX_REQUEST_SIZE = 2*1024*1024;

  return requestByCallsign('AFR1234')
    .then(() => expect(true).toBe(false))
    .catch(err => {
      expect(b2bRemote.isDone()).toBe(true);
      delete process.env.B2B_MAX_REQUEST_SIZE;
      expect(err.message).toMatch(/MAX_REQUEST_SIZE/);
    });
});

test('reject large downloads even if content-length header does not match', () => {
  const longData = (new Array(10*1024*1024)).join("x"); // 10MB

  const b2bRemote = nock(process.env.B2B_URL)
    .defaultReplyHeaders({
      'Content-Length': 1024*12, // Server replies 12KB
    })
    .post('/')
    .reply(200, longData);

  process.env.B2B_MAX_REQUEST_SIZE = 2*1024*1024;

  return requestByCallsign('AFR1234')
    .then(() => expect(true).toBe(false))
    .catch(err => {
      expect(b2bRemote.isDone()).toBe(true);
      delete process.env.B2B_MAX_REQUEST_SIZE;
      expect(err.message).toMatch(/MAX_REQUEST_SIZE/);
    });

});

