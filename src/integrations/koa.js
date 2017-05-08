const diagnostics = require('../diagnostics');


const NOOP = () => null;

function createMiddleware({ tracer={}, metrics={} }={}) {
  return function(ctx, next) {
    const {
      getClient=NOOP: getMetricsClient,
      createObserver=NOOP: createMetricsObserver,
    } = metrics;

    const {
      createObserver=NOOP: createTracingObserver,
    } = tracer;

    const {
      getLogger=NOOP:
    } = logger;

    ctx.span = new diagnostics.Span({
      name: ctx.url,      // TODO: turn slashes into underscores
      createObservers: [createTracingObserver, createMetricsObserver],
    });
    ctx.metrics = getMetricsClient();
    ctx.logger = getLogger();

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
