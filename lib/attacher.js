'use strict';

var Promise = require('bluebird');
var path = require('path');
var fs = Promise.promisifyAll(require('fs'));
var mkdirp = Promise.promisify(require('mkdirp'));

var s3 = require('./s3Store');
var debug = require('./debug');
var output = require('./output');
var verify = require('./configVerifier');


function _attachFiles(config) {
    var files = config.getFiles();

    debug(files.length + ' files to attach');
    var index = 0;
    var attachAllItems = function() {
        var item = files[index];

        if (item) {
            var itemPath = item.path;
            output('Attaching file: "' + itemPath + '"');

            var outputPath = path.resolve('/tmp/' + itemPath);

            // Ensure the directory exists
            var directory = path.dirname(outputPath);
            debug('Ensuring directory "' + directory + '" exists');
            return mkdirp(directory).then(function() {
                output('Getting "' + itemPath + '" from S3');
                return s3.getObjectAsync({
                    Bucket: config.s3Bucket,
                    Key: itemPath
                });
            }).then(function(s3Response) {
                // Write the contents to the file
                output('Writing "' + itemPath + '" to "' + outputPath + '"');
                var fileContents = s3Response.Body;

                // Only make executable if flagged as such
                var options = { encoding: 'binary' };
                if (item.executable) {
                    // Make sure it's executable (rwx --- ---)
                    debug('Setting "' + itemPath + '" as executable');
                    options.mode = 16832;
                }

                return fs.writeFileSync(outputPath, fileContents, options);
            }).then(function() {
                output('Attached "' + item.path + '"');
                index++;
                return attachAllItems();
            });
        } else {
            // All done
            output('File Attach Complete');
        }
    }

    return attachAllItems();
}

module.exports = function(config) {

    return verify(config).then(function() {
        return _attachFiles(config);
    });

}