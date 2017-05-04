const tracing = require('./diagnostics/tracing');
const koa = require('./integrations/koa');

module.exports = {
  koa,
  configureTracing: tracing.configureTracing,
};
