const datagram = require('dgram');
const punycode = require('punycode');

const Span = require('./index').Span;


function configureMetrics({ namespace, url=null, debug=false }={}) {
  function createObserver(span) {
    const spanMetrics = new Metrics({ namespace, url, debug, shouldBatch: true});
    return new MetricsObserver(span, `server.${span.name}`, spanMetrics);
  }

  return {
    createObserver,
    getClient: () => new Metrics({ namespace, url, debug }),
  }
}


class SocketTransport {
  constructor(url) {
    this.url = url;
    this.socketClient = datagram.createSocket('udp4');
  }

  send(message) {
    const { port, hostname } = this.url;
    this.socketClient.send(message, 0, message.length, port, hostname);
  }
}


class NoopTransport {
  send(metric) {
    console.log("Would have sent the metric: ", metric);
  }
}


class Metrics {
  constructor({ url, namespace, transport, debug, shouldBatch=false }={}) {
    this.namespace = punycode.toASCII(namespace);
    this.shouldBatch = shouldBatch;
    this.transport = debug ? new NoopTransport() : new SocketTransport(url);

    this.messages = [];
  }

  timer(name) {
    const timerName = `${this.namespace}.${punycode.toASCII(name)}`;
    return new Timer(timerName, msg => this.send(msg));;
  }

  counter(name) {
    const counterName = `${this.namespace}.${punycode.toASCII(name)}`;
    return new Counter(counterName, msg => this.send(msg));
  }

  send(message) {
    this.messages.push(message);
    if (!this.shouldBatch) {
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
    this.timeStart = null;
    this.timeEnd = null;
    this.onStop = onStop;
  }

  start() {
    if (this.timeEnd) {
      throw new Error('Timer already started.');
    }

    this.timeStart = Date.now();
  }

  stop() {
    if (!this.timeStart) {
      throw new Error('Timer not yet started.');
    }

    if (this.timeEnd) {
      throw new Error('Timer already stopped.');
    }
    this.timeEnd = Date.now();
    this.onStop(`${this.namespace}:${this.timeEnd - this.timeStart}|ms`);
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
    this.onStop(`${this.namespace}:${increment}|c`);
  }

  decrement(decrement=1) {
    this.increment(decrement);
  }
}


class MetricsObserver {
  constructor(span, name, metrics) {
    this.span = span;
    this.metrics = metrics;
    this.timer = metrics.timer(name);
  }

  onStart() {
    this.timer.start();
  }

  onFinish(exc=null) {
    this.timer.stop();
    if (this.span.type === Span.types.SERVER) {
      this.metrics.flush();
    }
  }

  onSubSpanCreated(span) {
    const name = span.isLocal ?
      `${span.componentName}.${span.name}` :
      `clients.${span.name}`;
    span.addObserver(new MetricsObserver(span, name, this.metrics));
  }

  // NOOPs
  onSetTag() {}
  onLog() {}
}

module.exports = {
  configureMetrics,
}
