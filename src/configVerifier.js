'use strict';

/**
 * Verify the configuration is minimally alid.
 * @param config The configuration object to verify
 * @returns {Promise} A Promise that resolves to the configuration object once
 * we have verified it's all good.
 */
import Promise from 'bluebird';
import debug from 'debug';

import realS3Store from './s3Store';
var s3 = realS3Store;

import realOutput from './output';
var output = realOutput;

export default function(config = {}) {
    if (config === null) {
        return Promise.reject(new Error('You must provide a configuration'));
    }
    var name = config.name;
    if (!name) {
        return Promise.reject(new Error('Lambdabox configuration must contain "name"'));
    }

    var bucket = config.s3Bucket;
    if (!bucket) {
        return Promise.reject(new Error('Lambdabox configuration must contain "s3Bucket"'));
    }

    // Verify we have the ability to read that bucket
    debug('Sending HEAD request to "' + bucket + '"');
    return s3.headBucketAsync({ Bucket: bucket })
        .then(() => {
            debug('Verified access to Bucket "' + bucket + '"');
            return config;
        }).catch(err => {
            // TODO:  Much better diagnosing of the error here.
            output('Error accessing Lambabox S3 bucket "' + bucket + '": ' + err.code);
            throw err;
        });
}

/**
 * Method to use for injecting certain dependencies in testing.
 * @param toInject
 */
function inject(toInject = {}) {
    s3 = toInject.s3 || s3;
    output = toInject.output || output;
}
export { inject };
