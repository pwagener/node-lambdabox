'use strict';

/**
 * Wrapper around S3 to promisify & lock the version
 */
import AWS from 'aws-sdk';
import Promise from 'bluebird';

var rawS3 = new AWS.S3({
    apiVersion: '2006-03-01'
});
export default Promise.promisifyAll(rawS3);
