import bunyan from 'bunyan';

export const logger = bunyan.createLogger({
  name: 'arcid-ops',
  streams: [
    {
      level: process.env.NODE_ENV === 'test' ? bunyan.FATAL + 1 : 'info',
      stream: process.stdout,
    }
  ],
});

export function opsLog(payload, msg) {
  return logger.info({payload}, msg);
}
