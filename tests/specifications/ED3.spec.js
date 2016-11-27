import nock from 'nock';
import R from 'ramda';
import { postToB2B } from '../../src/lib/b2b';
import { parseXML } from '../../src/lib/b2b/utils';

test('discard invalid response', () => {
  const b2bRemote = nock(process.env.B2B_URL)
    .post('/')
    .reply(200, "invalid xml data");


  return postToB2B({body: ''})
    .then(parseXML)
    .then(() => expect(true).toBe(false))
    .catch(err => {
      nock.cleanAll();
      expect(err.message).toMatch(/parse XML data/i);
    });
});
