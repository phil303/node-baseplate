const diagnostics = require('./diagnostics');

const NOOP = () = {};

function createMiddleware({ createTracer=NOOP, createMetrics=NOOP }={}) {
  return function(ctx, next) {
    ctx.span = new diagnostics.Span({
      name: ctx.url,      // TODO: turn slashes into underscores
      createObservers: [createTracer, createMetrics],
    });

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
