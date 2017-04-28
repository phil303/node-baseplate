const configureTracing = require('./diagnostics/configureTracing');
const koa = require('./integrations/koa');

module.exports = {
  koa,
  configureTracing,
};
