// Mock bunyan here
// We add a specific stream to opsLog
// We also put this stream in globals to ease access in tests
import {logger} from '../src/logger';
import bunyan from 'bunyan';
import nock from 'nock';
import uuid from 'node-uuid';

const ringBuffer = new bunyan.RingBuffer({limit: 20});
global.LOG_STREAM = ringBuffer;

logger.addStream({
  stream: ringBuffer,
  type: 'raw',
  level: 'trace',
});

global.B2B_URL = "https://b2b";
global.HISTORY_HARD_LIMIT = 30;

// Prevent requests from exiting
nock.disableNetConnect();
nock.enableNetConnect('127.0.0.1'); //Allow localhost connections so we can test local routes and mock servers.

beforeEach(() => {
  // There is some kind of race condition involving nock happening
  // We generate new URLs on each test to prevent that
  process.env.B2B_URL = global.B2B_URL + '-' + uuid.v4();

  process.env.HISTORY_HARD_LIMIT = global.HISTORY_HARD_LIMIT;
});

afterEach(() => {
  delete process.env.B2B_URL;
  delete process.env.HISTORY_HARD_LIMIT;
});
