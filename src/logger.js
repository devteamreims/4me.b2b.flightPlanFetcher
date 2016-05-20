import bunyan from 'bunyan';

const logger = bunyan.createLogger({name: 'arcid-ops'});

export function opsLog(payload, msg) {
  return logger.info({payload}, msg);
}
