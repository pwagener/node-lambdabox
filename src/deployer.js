'use strict';

/**
 * Deploy the lambdabox to S3
 */

import Promise from 'bluebird';
import path from 'path';
import _ from 'underscore';
import debug from 'debug';

// Injectable dependencies
import s3Store from './s3Store';
let localS3Store = s3Store;

import realFs from 'fs';
let fs = realFs;

import realOutput from './output';
let output = realOutput;

import realVerifier from './configVerifier';
let verifier = realVerifier;

/**
 * Method that copies one file up to S3.
 * @param bucket The s3 bucket to copy to
 * @param filePath
 * @returns {Promise.<T>} A promise that resolves when the file has been copied
 * @private
 */
function _copyFile(bucket, filePath) {
    var fullPath = path.resolve(filePath);
    var fileStream = fs.createReadStream(fullPath)

    return new Promise((resolve, reject) => {
        output('Copying "' + filePath + '" to "' + bucket + '/' + filePath + '"');
        var upload = localS3Store.upload({
            Bucket: bucket,
            Key: filePath,
            Body: fileStream
        }, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });

        upload.on('httpUploadProgress', evt => {
            debug('Deploying "' + filePath + '" ==> ' + evt.loaded +
                    ' / ' + evt.total + ' uploaded');
        });
    }).then(() => {
        debug('Upload of "' + filePath + '" complete');
    });
}

/**
 * Method that uploads any files  in the config to S3
 * @param config The configuration contents
 * @return {Promise} A Promise that resolves when all files have been copied
 * @private
 */
function _deployFiles(config) {
    var files = config.files;
    debug(files.length + ' files to deploy');

    var promises = _.map(config.files, file => {
        return _copyFile(config.s3Bucket, file.path);
    });
    return Promise.all(promises);
}

export default function (config) {
    return verifier(config).then(() => {
        output('Deploying Lambdabox "' + config.name + '"');

        // Upload the files
        return _deployFiles(config);
    });
}

/* istanbul ignore next */
function inject(toInject = {}) {
    fs = toInject.fs || fs;
    output = toInject.output || output;
    verifier = toInject.verifier || verifier;
    localS3Store = toInject.localS3Store || localS3Store;
}
export { inject };