const diagnostics = require('../diagnostics');

const NOOP = () => {};

function createMiddleware({ tracer={}, metrics={} }={}) {
  return function(ctx, next) {
    const {
      client=null: metricsClient,
      createObserver=NOOP: createMetricsObserver
    } = metrics;

    const { createObserver=NOOP: createTracingObserver } = tracer;

    ctx.span = new diagnostics.Span({
      name: ctx.url,      // TODO: turn slashes into underscores
      createObservers: [createTracingObserver, createMetricsObserver],
    });
    ctx.metrics = metricsClient;

    ctx.span.start();
    ctx.span.setTag("http.url", ctx.url);
    ctx.span.setTag("http.method", ctx.method);

    next()
      .then(() => {
        ctx.span.setTag("http.status_code", ctx.response.status)
        ctx.span.finish();
      });
  }
}

module.exports = createMiddleware;
