'use strict';

/**
 * Deploy the lambdabox to S3
 */

var Promise = require('bluebird');
var path = require('path');
var fs = Promise.promisifyAll(require('fs'));

var s3 = require('./s3Store');
var debug = require('./debug');
var output = require('./output');
var verify = require('./configVerifier');

function _copyFile(config, file) {
    output('Copying "' + file + '" to "' + config.s3Bucket + '"');

    var fullPath = path.resolve(file);
    return fs.readFileAsync(fullPath)
        .then(function (contents) {
            debug('Read contents of "' + file + '"');
            return s3.putObjectAsync({
                Bucket: config.s3Bucket,
                Key: file,
                Body: contents
            });
        }).then(function() {
            debug('Uploaded "' + file + '"');
        });
}

/**
 * Method that uploads any binaries listed in the configuration to S3
 * @param config The configuration contents
 * @private
 */
function _deployFiles(config) {
    var files = config.getFiles();

    debug(files.length + ' files to deploy');
    var index = 0;
    var uploadAllItems = function() {
        var file = files[index];
        if (file) {
            return _copyFile(config, file.path).then(function() {
                index++;
                return uploadAllItems();
            });
        } else {
            // All done
            output('Binary Deployment Complete');
        }
    }

    return uploadAllItems();
}

module.exports = function(config) {
    return verify(config).then(function() {
        output('Deploying Lambdabox "' + config.name + '"');

        // Upload the files
        return _deployFiles(config);
    });
}