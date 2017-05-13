const _isString = require('lodash/isString');
const _isNumber = require('lodash/isNumber');
const _isObject = require('lodash/isObject');
const _isFunction = require('lodash/isFunction');
const _isUndefined = require('lodash/isUndefined');
const _isBoolean = require('lodash/isBoolean');
const _isNil = require('lodash/isNil');

const types = {
  string: isString,
  number: isNumber,
  boolean: isBoolean,
  optional: isOptional,
}

function addType(name, validate) {
  types[name] = validate
}


function parseConfig(config, validation) {
  function _parseConfig(_config, _validation, currentObj) {
    for (let k in _validation) {
      const validate = _validation[k];
      const configVal = _config[k];

      // if there's a validation function but found a deeper nested config
      if (_isFunction(validate) && _isObject(configVal)) {
        throw new Error(`Expected leaf node at key '${k}' but found object.`);

      // if there's a validation function but no corresponding key at all
      } else if (_isFunction(validate) && !(k in _config)) {
        throw new Error(`Expected configuration at key '${k}' but found none.`);

      // if there's a validation key but the function is undefined
      } else if (_isUndefined(validate)) {
        throw new Error(`Found undefined validator at key '${k}'`);

      // if both validation and config are objects, recurse
      } else if (_isObject(validate) && _isObject(configVal)) {
        const newObj = currentObj[k] = {};
        _parseConfig(configVal, validate, newObj);

      // finally, this is a validation function and a leaf node, validate
      } else {
        currentObj[k] = validate(configVal, k);
      }
    }
  }

  const finalConfig = {};
  _parseConfig(config, validation, finalConfig);
  return finalConfig;
}


function genericValidate(v, k, validate, expectedType) {
  if (!validate(v)) {
    const msg = `Expected value at key '${k}' to be of type ` +
      `'${expectedType}'. Received type '${typeof v}' instead.`
    throw new Error(msg);
  }
  return v;
}

function isBoolean(value, key) {
  return genericValidate(key, value, _isBoolean, 'boolean');
}

function isString(value, key) {
  return genericValidate(key, value, _isString, 'string');
}

function isNumber(value, key) {
  return genericValidate(value, key, _isNumber, 'number');
}

function isOptional(validate) {
  if (!_isFunction(validate)) {
    throw new Error('Must first pass in a type to \'optional\'.');
  }

  return function(value, key) {
    if (!_isNil(value)) {
      return validate(key, value);
    }
    return value;
  }
}


module.exports = {
  types,
  parseConfig,
  addType,
}
