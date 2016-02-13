'use strict';

import Promise from 'bluebird';
import path from 'path';
import debug from './debug';
import _ from 'underscore';

// Injectable dependencies
import rawMkdirp from 'mkdirp';
let mkdirp = Promise.promisify(rawMkdirp);

import rawFs from 'fs';
let fs = Promise.promisifyAll(rawFs);

import s3Store from './s3Store';
let s3 = s3Store;

import realOutput from './output';
let output = realOutput;

import realVerifier from './configVerifier';
let verifier = realVerifier;

function _copyFile(bucket, file) {
    const itemPath = file.path;
    const outputPath = path.resolve('/tmp/' + file.path);
    const directory = path.dirname(outputPath);

    return mkdirp(directory).then(() => {
        output('Getting "' + itemPath + '" from S3');
        return s3.getObjectAsync({
            Bucket: bucket,
            Key: itemPath
        });
    }).then(s3Response => {
        // Write the contents to the file
        output('Writing "' + itemPath + '" to "' + outputPath + '"');
        var fileContents = s3Response.Body;

        // Only make executable if flagged as such
        var options = { encoding: 'binary' };
        if (file.executable) {
            // Make sure it's executable (rwx --- ---)
            debug('Setting "' + itemPath + '" as executable');
            options.mode = 16832;
        }

        fs.writeFileSync(outputPath, fileContents, options);
        output('Attached "' + itemPath + '"');
    });
}

function _attachFiles(config) {
    output('Attaching Lambdabox "' + config.name + '"');

    var files = config.files;
    debug(files.length + ' files to attach');
    var promises = _.map(files, file => {
        return _copyFile(config.s3Bucket, file);
    });

    return Promise.all(promises);
}

function _alwaysRetryOnFailure(config) {
    return _attachFiles(config)
            .catch((err) => {
                output('Attached failed: ' + err);
                return Promise.delay(config.attachRetryDelay)
                        .then(() => {
                            output('Retrying ...');
                            return _alwaysRetryOnFailure(config);
                        });
            });
}

export default function(config) {
    return verifier(config).then(() => {
        return _alwaysRetryOnFailure(config);
    });
}

/* istanbul ignore next */
function inject(toInject = {}) {
    mkdirp = toInject.mkdirp || mkdirp;
    fs = toInject.fs || fs;
    s3 = toInject.s3 || s3;
    output = toInject.output || output;
    verifier = toInject.verifier || verifier;
}
export { inject };