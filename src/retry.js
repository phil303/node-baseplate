const random = require('lodash/random');

/**
 * A backoff logic helper for retries, which accepts options and a callback.
 * The callback receives a `retry` function as a parameter that can be fired
 * when a chosen failure condition has been met.
 *
 * Example usage:
 * retry({ attempts: 5, backoff: 100, jitter: true }, _retry => {
 *   return request('https://foobar.com').then(resp => {
 *     if (resp.status_code !== 200) {
 *       return _retry();
 *     }
 *
 *     return resp;
 *   });
 * })
 *   .then(resp => console.log(resp))
 *   .catch(() => console.log('network failure'));
 *
 * @param {object} options
 * @param {number} options.budget   - time in milliseconds, total allowance
 *                                    for retries
 * @param {number} options.backoff  - time in milliseconds, the time the
 *                                    backoff is based on
 * @param {number} [options.attempts=1]     - number of request attempts
 * @param {boolean} [options.jitter=false]  - whether or not to randomize
 *                                            backoff
 * @param {function} createRequest  - the request to fire on each attempt
 *
 * @returns {Promise} - represents the status of the request
 */
function retry(options={}, createRequest) {
  const {
    budget=null,
    backoff=null,
    attempts=1,
    jitter=false,
  } = options;

  let timeout = 0;
  let currentAttempt = 0;
  const start = Date.now();

  function _retry() {
    return new Promise((resolve, reject) => {
      if (jitter && backoff) {
        // https://www.awsarchitectureblog.com/2015/03/backoff.html
        // "full jitter" implementation
        timeout = random(0, backoff * Math.pow(2, currentAttempt, floating=true));

      } else if (backoff) {
        // exponential backoff
        timeout = backoff * Math.pow(2, currentAttempt);
      }

      currentAttempt += 1;
      if (currentAttempt >= attempts || (budget && Date.now() - start > budget)) {
        reject();
        return;
      }

      setTimeout(resolve, timeout);
    })
      .then(() => createRequest(_retry))
      .catch(e => {
        if (e instanceof Error) {
          console.error(e);
        }
        return Promise.reject();
      });
  }

  return createRequest(_retry);
}


/**
 * Create a retry function with a common set of retry parameters. Useful if
 * you'll be using the same retry logic in multiple places.
 *
 * @param {object} options
 * @param {number} options.int      - time in milliseconds, number of retries
 * @param {number} options.backoff  - time in milliseconds, the time the
 *                                    backoff is based on
 * @param {number} [options.attempts=1]     - number of request attempts
 * @param {boolean} [options.jitter=false]  - whether or not to randomize
 *                                            backoff
 *
 * @returns {function} - returns a retry decorator
 *
 * Usage:
 * const retry = retryLogic({ attempts: 5, backoff: 100, jitter: true });
 *
 * retry(_retry => {
 *   return request('https://foobar.com').then(resp => {
 *     if (resp.status_code !== 200) {
 *       return _retry();
 *     }
 *
 *     return resp;
 *   });
 * })
 *   .then(resp => console.log(resp))
 *   .catch(() => console.log('network failure'));
 */
function retryLogic(options={}) {
  return createRequest => retry(options, createRequest);
}

module.exports = {
  retry,
  retryLogic,
};
