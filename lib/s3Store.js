'use strict';

/**
 * Wrapper around S3 to promisify & lock the version
 */
var AWS = require('aws-sdk'),
    Promise = require('bluebird');

module.exports = Promise.promisifyAll(new AWS.S3({
    apiVersion: '2006-03-01'
}));
