const tracing = require('./src/diagnostics/tracing');
const koa = require('./src/integrations/koa');

module.exports = {
  koa,
  configureTracing: tracing.configureTracing,
};
