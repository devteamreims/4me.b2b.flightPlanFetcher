// Mock bunyan here
// We add a specific stream to opsLog
// We also put this stream in globals to ease access in tests
import {logger} from '../src/logger';
import bunyan from 'bunyan';
const ringBuffer = new bunyan.RingBuffer({limit: 20});
global.LOG_STREAM = ringBuffer;

logger.addStream({
  stream: ringBuffer,
  type: 'raw',
  level: 'trace',
});

global.B2B_URL = "https://b2b";
global.HISTORY_HARD_LIMIT = 30;

beforeEach(() => {
  process.env.B2B_URL = global.B2B_URL;
  process.env.HISTORY_HARD_LIMIT = global.HISTORY_HARD_LIMIT;
});

afterEach(() => {
  delete process.env.B2B_URL;
  delete process.env.HISTORY_HARD_LIMIT;
});
