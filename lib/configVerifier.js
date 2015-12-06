'use strict';

/**
 * Verify the configuration is minimally alid.
 * @param config The configuration object to verify
 * @returns {Promise} A Promise that resolves to the configuration object once
 * we have verified it's all good.
 */
var Promise = require('bluebird');

var s3 = require('./s3Store');
var debug = require('./debug');
var output = require('./output');

module.exports = function(config) {
    var name = config.name;
    if (!name) {
        return Promise.reject(new Error('Lambdabox configuration must contain "name" as a unique project name'));
    }

    var bucket = config.s3Bucket;
    if (!bucket) {
        return Promise.reject(new Error('Lambdabox configuration must contain "s3Bucket", indicating the S3 bucket to use'));
    }

    // Verify we have the ability to read that bucket
    return s3.headBucketAsync({ Bucket: bucket })
        .then(function() {
            debug('Verified access to Bucket "' + bucket + '"');
            return config;
        }).catch(function(err) {
            output('Error accessing Lambabox S3 bucket "' + bucket + '": ' + err.code);
            throw err;
        });
}
