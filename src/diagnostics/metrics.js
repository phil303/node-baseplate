const datagram = require('dgram');

const Span = require('./index').Span;


function configureMetrics({ namespace, url, debug }={}) {
  const metrics = Metrics({ namespace, transport, debug });
  const batchedMetrics = Metrics({ namespace, transport, debug, shouldBatch: true});

  function createObserver(span) {
    return MetricsObserver(span, `server.${span.name}`, batchingMetrics);
  }

  return {
    client,
    createObserver,
  }
}


class SocketTransport {
  constructor({ url }={}) {
    this.url = url;
    this.socketClient = datagram.createSocket('udp4');
  }

  send(message) {
    // TODO: does metric need to be ascii encoded? And should I convert it to a
    // buffer and use that length?
    const { port, hostname } = this.url;
    this.socketClient.send(message, 0, message.length, port, hostname);
  }
}


class NoopTransport {
  send(metric) {
    console.log(metric);
  }
}


class Metrics {
  constructor({ namespace, transport, debug, shouldBatch=false }={}) {
    this.namespace = namespace;
    this.shouldBatch = shouldBatch;
    this.transport = debug ? new NoopTransport() : new SocketTransport({ url });

    this.messages = [];
    this.timerCache = {};
    this.counterCache = {};
  }

  timer(name) {
    if (!this.timerCache[name]) {
      const timerName = this.namespace + name;
      this.timerCache[name] = new Timer(timerName, msg => this.send(msg));
    }
    return this.timerCache[name];
  }

  counter(name) {
    this.counterCache[name] = this.counterCache[name];
    if (!this.counterCache[name]) {
      const counterName = this.namespace + name;
      this.counterCache[name] = new Counter(counterName, msg => this.send(msg));
    }
    return this.counterCache[name];
  }

  send() {
    this.messages.push(message);
    if (this.shouldBuffer) {
      this.flush();
    }
  }

  flush() {
    const message = this.messages.join('\n');
    this.transport.send(message);
    this.messages = [];
  }
}


/**
 * A timer for recording elapsed times.
 */
class Timer {
  constructor(namespace, onStop) {
    this.namespace = namespace;
    this.start = null;
    this.end = null;
    this.onStop = onStop;
  }

  start() {
    if (this.end) {
      throw new Error('Timer already started.');
    }

    this.start = Date.now();
  }

  stop() {
    if (!this.start) {
      throw new Error('Timer not yet started.');
    }

    if (this.end) {
      throw new Error('Timer already stopped.');
    }
    this.end = Date.now();
    this.onStop(`${name}:${this.end - this.start}|ms`);
  }
}


/**
 * A counter for counting events over time.
 */
class Counter {
  constructor(namespace, onStop) {
    this.namespace = namespace;
    this.onStop = onStop;
  }

  increment(increment=1) {
    this.onStop(`${name}:${increment}|c`);
  }

  decrement(decrement=1) {
    this.increment(decrement);
  }
}


class MetricsObserver {
  constructor(span, name, metrics) {
    this.span = span;
    this.name = name;
    this.metrics = metrics;
  }

  onStart() {
    this.metrics.timer(this.name).start();
  }

  onFinish() {
    this.metrics.timer(this.name).end();
    if (this.span.type === Span.SERVER) {
      this.metrics.flush();
    }
  }

  onSubSpanCreated(span) {
    const name = span.isLocal ?
      `${span.componentName}.${span.name}` :
      `clients.${span.name}`;
    span.addObserver(new MetricsObserver(span, name, this.metrics));
  }
}
