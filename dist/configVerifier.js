'use strict';

/**
 * Verify the configuration is minimally alid.
 * @param config The configuration object to verify
 * @returns {Promise} A Promise that resolves to the configuration object once
 * we have verified it's all good.
 */

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.inject = undefined;

exports.default = function () {
    var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    if (config === null) {
        return _bluebird2.default.reject(new Error('You must provide a configuration'));
    }
    var name = config.name;
    if (!name) {
        return _bluebird2.default.reject(new Error('Lambdabox configuration must contain "name"'));
    }

    var bucket = config.s3Bucket;
    if (!bucket) {
        return _bluebird2.default.reject(new Error('Lambdabox configuration must contain "s3Bucket"'));
    }

    // Verify we have the ability to read that bucket
    (0, _debug2.default)('Sending HEAD request to "' + bucket + '"');
    return s3.headBucketAsync({ Bucket: bucket }).then(function () {
        (0, _debug2.default)('Verified access to Bucket "' + bucket + '"');
        return config;
    }).catch(function (err) {
        // TODO:  Much better diagnosing of the error here.
        output('Error accessing Lambabox S3 bucket "' + bucket + '": ' + err.code);
        throw err;
    });
};

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _s3Store = require('./s3Store');

var _s3Store2 = _interopRequireDefault(_s3Store);

var _output = require('./output');

var _output2 = _interopRequireDefault(_output);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var s3 = _s3Store2.default;

var output = _output2.default;

/**
 * Method to use for injecting certain dependencies in testing.
 * @param toInject
 */
function inject() {
    var toInject = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    s3 = toInject.s3 || s3;
    output = toInject.output || output;
}
exports.inject = inject;