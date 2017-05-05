const _request = require('request');

/**
 * Wrap `request` with a Promise
 * https://github.com/request/request#requestoptions-callback
 * Arguments are just passed through to the library's version of `request`.
 * You can pass a simple string and it will default to a GET or you can pass
 * an options object such as:
 *
 * {
 *   method: 'POST',
 *   url: 'http://example.com',
 * }
 */
function request(...args) {
  return new Promise((resolve, reject) => {
    _request(...args)
      .on('response', resolve)
      .on('error', reject);
  });
}

module.exports = request;
