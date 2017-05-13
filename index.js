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
// IMMEDIATE:
//   - thrift installation and compiler
//   - retry logic
//   - http client
//   - configuration validation
//   - how does logging to file work in prod
//      - a: just print to sysout, it gets captured
//        - q: is there a way to get colored output?
//   - checking prod metrics actually work
//
// MEDIUM TERM:
//   - tests
//   - event queue process
//   - source mapping
//   - cookiecutter
//   - README/tutorial

// QUESTIONS
//   - How do spans relate to asynchronous requests?
//   - How do spans releate to queue based requests?

// QUESTIONS FOR INFRA:
//   - Can we read from a json config file in production as opposed to
//   setting ENV variables
//   - Easier way to deploy a node-baseplate service then what we have now if
//   it's standardized?
