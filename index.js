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
