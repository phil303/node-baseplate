const HALF_BYTE_COUNT = 16;
const HEX_DIGITS = '0123456789abcdef';

function generateTraceId() {
  let n = '';
  for (let i = 0; i < HALF_BYTE_COUNT; i++) {
    const rand = Math.floor(Math.random() * HEX_DIGITS.length);

    // avoid leading zeroes
    if (rand !== 0 || n.length > 0) {
      n += HEX_DIGITS[rand];
    }
  }
  return n;
}


/**
 * A span is a diagnostic-based representation of a request or RPC call. Spans
 * can represent code acting as server (receiving inbound requests), client
 * (making outgoing requests), or local piece of code.
 */
class Span {
  static get types() {
    return {
      LOCAL: Symbol(),
      SERVER: Symbol(),
      CLIENT: Symbol(),
    };
  }

  constructor(options) {
    const {
      name,
      traceId=null,
      parentId=null,
      spanId=null,    // TODO: when is spanId explicitly set?
      createObservers=[],
      type=Span.types.SERVER,
    } = options;

    if (!name) {
      throw new Error("`name` must be defined");
    }

    this.name = name;
    this.traceId = traceId || generateTraceId();
    this.id = spanId || this.traceId;
    this.parentId = parentId;

    this.type == type;
    this.isLocal = type == Span.types.LOCAL;

    this.createObservers = createObservers;
    this.observers = createObservers
      .map(create => create(this))
      .filter(observer => observer != undefined);
  }

  // wrap(fn) {
  //   return function(...args) {
  //     this.start();

  //     try {
  //       fn(...args);
  //       this.finish();
  //     } catch (err) {
  //       this.finish(err);
  //     }
  //   }
  // }

  start() {
    this.observers.forEach(observer => observer.onStart());
  }

  /**
   * Tags are arbitrary key/value pairs that add context and meaning to the
   * span, such as a hostname or query string. Observers may interpret or
   * ignore tags as they desire.
   *
   * @param {string} key
   * @param {string} value
   */
  setTag(key, value) {
    this.observers.forEach(observer => observer.onSetTag(key, value));
  }

  /**
   * Log entries are timestamped events recording notable moments in the
   * lifetime of a span.
   *
   * @param {string} name - The name of the log entry. This should be a stable
                            identifier that can apply to multiple span
                            instances.
   * @param {any} payload - Arbitrary data
   */
  log(name, payload=null) {
    this.observers.forEach(observer => observer.onLog(name, payload));
  }

  /**
   * Record the end of the span.
   *
   * @param {Error|null} err
   */
  finish(err=null) {
    this.observers.forEach(observer => observer.onFinish(err));
  }

  createSubSpan(name, isLocal=true) {
    const span = Span({
      name,
      type: isLocal ? Span.types.LOCAL : Span.types.CLIENT,
      traceId: this.traceId,
      parentId: this.id,
      observers: this.createObservers,
    });

    this.observers.forEach(observer => observer.onSubSpanCreated(span));

    return span;
  }
}

module.exports = Span;
