'use strict';

var Promise = require('bluebird');
var path = require('path');
var fs = Promise.promisifyAll(require('fs'));
var mkdirp = Promise.promisify(require('mkdirp'));

var s3 = require('./s3Store');
var debug = require('./debug');
var output = require('./output');
var verify = require('./configVerifier');


function _attachBinaries(config) {
    var toAttach = [];
    var binaries = config.binaries || [];

    for (var i = 0; i < binaries.length; i++) {
        var binary = binaries[i];
        toAttach.push(binary.path);
    }

    var index = 0;
    var attachAllItems = function() {
        var item = toAttach[index];

        if (item) {
            output('Attaching binary: "' + item + '"');

            var outputPath = path.resolve('/tmp/' + item);

            // Ensure the directory exists
            var directory = path.dirname(outputPath);
            debug('Ensuring directory "' + directory + '" exists');
            return mkdirp(directory).then(function() {
                output('Getting "' + item + '" from S3');
                return s3.getObjectAsync({
                    Bucket: config.bucket,
                    Key: item
                });
            }).then(function(s3Response) {
                // Write the contents to the file
                output('Writing "' + item + '" to "' + outputPath + '"');
                var fileContents = s3Response.Body;
                return fs.writeFileSync(outputPath, fileContents, {
                    encoding: 'binary',
                    mode: 16832  // Make sure it's executable (rwx --- ---)
                });
            }).then(function() {
                output('Attached "' + item + '"');
                index++;
                return attachAllItems();
            });
        } else {
            // All done
            output('Binary Attach Complete');
        }
    }

    return attachAllItems();
}

// TODO:  check to see if the items are available locally.  If so, don't copy.
module.exports = function(config) {

    return verify(config).then(function() {
        return _attachBinaries(config);
    });

}