const datagram = require('dgram');

function configureMetrics(options) {
  const client = MetricsClient({ stuff });

  function createObserver(span) {
  }

  return {
    client,
    createObserver,
  }
}


class SocketTransport {
  // TODO: make Host a proper object
  constructor(debug, host) {
    this.debug = debug;
    this.socketClient = datagram.createSocket('udp4');
    this.host = host;
  }

  send(metric) {
    // TODO: does metric need to be ascii encoded? And should I convert it to a
    // buffer and use that length?
    const { port, hostname } = this.host;
    this.socketClient.send(metric, 0, metric.length, port, hostname, () => {
      this.socketClient.close();
    });
  }
}


class MetricsClient {
  constructor(namespace, debug) {
    this.namespace = namespace;
    this.transport = new SocketTransport(debug);
    this.debug = debug;

    this.timerCache = {};
    this.counterCache = {};
  }

  timer(name) {
    const timerName = this.namespace + name;
    this.timerCache[name] = this.timerCache[name] || new Timer(timerName);
    return this.timerCache[name];
  }

  counter(name) {
    const counterName = this.namespace + name;
    this.counterCache[name] = this.counterCache[name] || new Counter(counterName);
    return this.counterCache[name];
  }
}


/**
 * A timer for recording elapsed times.
 */
class Timer {
  constructor(namespace) {
    this.namespace = namespace;
    this.start = null;
    this.end = null;
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
    this.transport.send(`${name}:${this.end - this.start}|ms`);
  }
}


/**
 * A counter for counting events over time.
 */
class Counter {
  constructor(namespace) {
    this.namespace = namespace;
  }

  increment(increment=1) {
    this.transport.send(`${name}:${increment}|c`);
  }

  decrement(decrement=1) {
    this.increment(decrement);
  }
}
