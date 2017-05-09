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
    debug: 'blue',
  }
};

function configureLogging({ filePath=null, debug=false, makeGlobal=false }={}) {
  const transport = !filePath
    ? new winston.transports.Console(Object.assign({}, { pretyPrint: true, colorize: true }))
    : new winston.transports.File(
      Object.assign({}, sharedOptions, {
        // TODO: filepath
        colorize: true,
        handleExceptions: true,
        humanReadableUnhandledException: true,
        json: true,
      })
    );

  const logger = new winston.Logger({
    transports: [ transport ],
    level: debug ? 'debug' : 'info',
    levels: LOG_LEVELS.levels,
    colors: LOG_LEVELS.colors,
  });

  if (makeGlobal) {
    global.logger = logger;
    logger.info('Setting up `logger` variable as global');
  }


  return {
    getLogger: () => logger,
  }
}

module.exports = {
  configureLogging,
};
