const winston = require('winston');

// TODO a `log` log level?
const LOG_LEVELS = {
  levels: {
    critical: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
  },
  colors: {
    critical: 'red',
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: null,
  }
};

function configureLogging(options={}) {
  const {
    debug,
  } = options;

  // TODO: unhandled exceptions go where?
  const logger = new winston.Logger({
    transports: [ new winston.transports.Console() ],
    levels: LOG_LEVELS,
  });

  return {
    getLogger: () => logger,
  };
}

module.exports = {
  configureLogging,
};
