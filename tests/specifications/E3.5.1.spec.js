import request from 'supertest';
import nock from 'nock';
import _ from 'lodash';
import fp from 'lodash/fp';

import Promise from 'bluebird';

describe('E3.5.1 : must produce logs for incoming requests', () => {
  const mockRequestByCallsign = () => Promise.resolve({
    body: {
      summaries: [],
    },
  });

  beforeEach(() => {
    // Mock autocomplete
    jest.mock('../../src/actions/autocomplete-cache', () => {
      return {
        refreshAutocomplete: () => ({type: 'MOCK_ACTION'}),
      };
    });
    // Mock requestByCallsign

    jest.mock('../../src/lib/b2b/index', () => {
      return {
        requestByCallsign: mockRequestByCallsign,
      };
    });
  });

  afterEach(() => {
    jest.resetModules();
  });

  test('searchFlights', () => {

    const app = require('../../index').default;
    const callsign = 'AFR12345';

    const performQuery = () => request(app).get(`/searchFlights?callsign=${callsign}`)

    return Promise.resolve()
      .then(performQuery)
      .finally(() => {
        const logRecord = fp.pipe(
          fp.get('LOG_STREAM.records'),
          fp.last
        )(global);

        expect(logRecord.payload.requestByCallsign).toBe(true);
        expect(logRecord.payload.callsign).toBe(callsign);
      });
  });
});
