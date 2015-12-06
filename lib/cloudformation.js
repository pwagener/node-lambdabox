'use strict';

/**
 * Slight Promisified wrapper around AWS.CloudFormation
 */

var AWS = require('aws-sdk'),
    Promise = require('bluebird');

module.exports = Promise.promisifyAll(new AWS.CloudFormation({
    apiVersion: '2010-05-15',
    region: 'us-east-1'
}));