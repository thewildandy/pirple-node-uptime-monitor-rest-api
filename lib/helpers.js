const crypto = require('crypto');
const config = require('../config');

const helpers = {};

helpers.hash = function (str) {
  if (typeof(str) == 'string' && str.length > 0) {
    return crypto.createHash('sha256', config.hashingSecret).update(str).digest('hex');
  } else {
    return false;
  }
}

helpers.parse = function (jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.log('Error: payload contains invalid JSON');
    return {};
  }
}

module.exports = helpers;
