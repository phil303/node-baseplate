const tracing = require('./src/diagnostics/tracing');
const metrics = require('./src/diagnostics/metrics');
const logging = require('./src/diagnostics/logging');
const koa = require('./src/integrations/koa');

module.exports = {
  koa,
  configureTracing: tracing.configureTracing,
  configureMetrics: metrics.configureMetrics,
  configureLogging: logging.configureLogging,
};


// TODO:
// BASIC:
//   - thrift istallation and compiler
//   - retry logic
//   - http client
//   - configuration validation
//   - how does logging to file work in prod
//   - checking prod metrics actually work
//
// MEDIUM TERM:
//   - tests
//   - event queue process
//   - source mapping
//   - cookiecutter
//   - README/tutorial
