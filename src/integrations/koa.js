const diagnostics = require('../diagnostics');


const NOOP = () => null;

function createMiddleware({ tracer={}, metrics={}, logger={} }={}) {
  return function(ctx, next) {
    const {
      getClient: getMetricsClient=NOOP,
      createObserver: createMetricsObserver=NOOP,
    } = metrics;

    const {
      createObserver: createTracingObserver=NOOP,
    } = tracer;

    const {
      getLogger=NOOP,
    } = logger;

    ctx.metrics = getMetricsClient();
    ctx.logger = getLogger();

    ctx.span = new diagnostics.Span({
      name: ctx.url,        // TODO: do we need a true name here?
      createObservers: [createTracingObserver, createMetricsObserver],
    });

    ctx.span.start();
    ctx.span.setTag("http.url", ctx.url);
    ctx.span.setTag("http.method", ctx.method);

    next()
      .then(() => {
        ctx.span.setTag("http.status_code", ctx.response.status)
        ctx.span.finish();
      })
      .catch(console.log)
  }
}

module.exports = createMiddleware;
