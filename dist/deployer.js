'use strict';

/**
 * Deploy the lambdabox to S3
 */

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.inject = undefined;

exports.default = function (config) {
    return verifier(config).then(function () {
        output('Deploying Lambdabox "' + config.name + '"');

        // Upload the files
        return _deployFiles(config);
    });
};

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _s3Store = require('./s3Store');

var _s3Store2 = _interopRequireDefault(_s3Store);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _output = require('./output');

var _output2 = _interopRequireDefault(_output);

var _configVerifier = require('./configVerifier');

var _configVerifier2 = _interopRequireDefault(_configVerifier);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var localS3Store = _s3Store2.default;

// Injectable dependencies


var fs = _fs2.default;

var output = _output2.default;

var verifier = _configVerifier2.default;

/**
 * Method that copies one file up to S3.
 * @param bucket The s3 bucket to copy to
 * @param filePath
 * @returns {Promise.<T>} A promise that resolves when the file has been copied
 * @private
 */
function _copyFile(bucket, filePath) {
    var fullPath = _path2.default.resolve(filePath);
    var fileStream = fs.createReadStream(fullPath);

    return new _bluebird2.default(function (resolve, reject) {
        output('Copying "' + filePath + '" to "' + bucket + '/' + filePath + '"');
        var upload = localS3Store.upload({
            Bucket: bucket,
            Key: filePath,
            Body: fileStream
        }, function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });

        upload.on('httpUploadProgress', function (evt) {
            (0, _debug2.default)('Deploying "' + filePath + '" ==> ' + evt.loaded + ' / ' + evt.total + ' uploaded');
        });
    }).then(function () {
        (0, _debug2.default)('Upload of "' + filePath + '" complete');
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
    (0, _debug2.default)(files.length + ' files to deploy');

    var promises = _underscore2.default.map(config.files, function (file) {
        return _copyFile(config.s3Bucket, file.path);
    });
    return _bluebird2.default.all(promises);
}

/* istanbul ignore next */
function inject() {
    var toInject = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    fs = toInject.fs || fs;
    output = toInject.output || output;
    verifier = toInject.verifier || verifier;
    localS3Store = toInject.localS3Store || localS3Store;
}
exports.inject = inject;