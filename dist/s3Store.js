'use strict';

/**
 * Wrapper around S3 to promisify & lock the version
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rawS3 = undefined;

var _awsSdk = require('aws-sdk');

var _awsSdk2 = _interopRequireDefault(_awsSdk);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var rawS3 = new _awsSdk2.default.S3({
  apiVersion: '2006-03-01'
});
exports.default = _bluebird2.default.promisifyAll(rawS3);
exports.rawS3 = rawS3;