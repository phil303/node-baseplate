const os = require('os');

const pick = require('lodash/pick');

const Span = require('./index');
const request = require('../utils/request');


const TIME_ANNOTATIONS = {
  [Span.types.SERVER]: {
    start: 'sr',
    end: 'ss',
  },
  [Span.types.CLIENT]: {
    start: 'cs',
    end: 'cr',
  },
};

const LOCAL_COMPONENT = 'lc';

function configureTracing(options) {
  const recorder = diagnostics.TracingRecorder(
    pick(options, ['debug', 'batchInterval', 'maxBatchSize', 'endpoint']),
  );

  return function createTracer(span) {
    if (!options.forceSampling && Math.random() > options.sampleRate) {
      return null;
    }

    return TracingObserver(Object.assign(
      pick(options, ['serviceName', 'debug']),
      { recorder, span },
    ));
  }
}


class TracingRecorder {
  constructor({ endpoint=null, batchInterval=500, maxBatchSize=100, debug=false }={}) {
    this.debug = debug;
    this.batchInterval = batchInterval;
    this.maxBatchSize = maxBatchSize;
    this.spansQueue = [];

    this.flushSpans();
  }

  flushSpans() {
    const spans = []
    while (this.spansQueue.length || spans.length < this.maxBatchSize) {
      spans.append(this.spansQueue.shift());
    }

    if (spans.length) {
      // TODO
      if (this.debug) {
        console.log('spans ', spans);
      } else {
        console.log('spans ', spans);
      }
    }

    setTimeout(() => this.flushSpans(), this.batchInterval)
  }
}


class TracingObserver {
  constructor({ span, serviceName, recorder }={}) {
    if (!span) {
      throw new Error('`span` must be passed into the constructor');
    }

    if (!serviceName) {
      throw new Error('`serviceName` must be passed into the constructor');
    }

    if (!recorder) {
      throw new Error('`recorder` must be passed into the constructor');
    }

    Object.assign(this, { span, serviceName, recorder });

    this.hostname = os.hostname();

    this.start = null;
    this.elapsed = null;

    this.annotations = [];
    this.binaryAnnotations = [];

    if (span.isLocal) {
      this.binaryAnnotations.push(this._createBinaryAnnotation(
        LOCAL_COMPONENT,
        this.span.name,
      ))
    }
  }

  onStart() {
    this.start = Date.now();

    if (!this.span.isLocal) {
      this.annotations.push(this._createTimeAnnotation(
        TIME_ANNOTATIONS[span.type].start,
        this.start,
      ));
    }
  }

  onSetTag(key, value) {
    this.binaryAnnotations.push(this._createBinaryAnnotation(key, value));
  }

  onFinish(exc=null) {
    const end = Date.now();
    this.elapsed = end - this.start;

    if (!this.span.isLocal) {
      this.annotations.push(this._createTimeAnnotation(
        TIME_ANNOTATIONS[span.type].end,
        end,
      ));
    }

    this.recorder.send(this._serialize());
  }

  // No-ops
  onSubSpanCreated() {}
  onLog() {}

  _createTimeAnnotation(type, timestamp) {
    return {
      value: type,
      timestamp: timestamp,
      endpoint: this._endpointInfo(),
    }
  }

  _createBinaryAnnotation(type, value) {
    return {
      value,
      key: type,
      endpoint: this._endpointInfo(),
    }
  }

  _endpointInfo() {
    return {
      serviceName: this.serviceName,
      ipv4: this.hostname
    };
  }

  _serialize() {
    return {
      id: this.span.id,
      traceId: this.span.traceId,
      parentId: this.span.parentId || 0,
      name: this.span.name,
      timestamp: this.start,
      duration: this.elapsed,
      annotations: this.annotations,
      binaryAnnotations: this.binaryAnnotations,
    };
  }
}

module.exports = configureTracing;
