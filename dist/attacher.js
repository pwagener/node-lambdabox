'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.inject = undefined;

exports.default = function (config) {
    return verifier(config).then(function () {
        return _alwaysRetryOnFailure(config);
    });
};

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _debug = require('./debug');

var _debug2 = _interopRequireDefault(_debug);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _s3Store = require('./s3Store');

var _s3Store2 = _interopRequireDefault(_s3Store);

var _output = require('./output');

var _output2 = _interopRequireDefault(_output);

var _configVerifier = require('./configVerifier');

var _configVerifier2 = _interopRequireDefault(_configVerifier);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mkdirp = _bluebird2.default.promisify(_mkdirp2.default);

// Injectable dependencies


var fs = _bluebird2.default.promisifyAll(_fs2.default);

var s3 = _s3Store2.default;

var output = _output2.default;

var verifier = _configVerifier2.default;

function _copyFile(bucket, file) {
    var itemPath = file.path;
    var outputPath = _path2.default.resolve('/tmp/' + file.path);
    var directory = _path2.default.dirname(outputPath);

    return mkdirp(directory).then(function () {
        output('Getting "' + itemPath + '" from S3');
        return s3.getObjectAsync({
            Bucket: bucket,
            Key: itemPath
        });
    }).then(function (s3Response) {
        // Write the contents to the file
        output('Writing "' + itemPath + '" to "' + outputPath + '"');
        var fileContents = s3Response.Body;

        // Only make executable if flagged as such
        var options = { encoding: 'binary' };
        if (file.executable) {
            // Make sure it's executable (rwx --- ---)
            (0, _debug2.default)('Setting "' + itemPath + '" as executable');
            options.mode = 16832;
        }

        fs.writeFileSync(outputPath, fileContents, options);
        output('Attached "' + itemPath + '"');
    });
}

function _attachFiles(config) {
    output('Attaching Lambdabox "' + config.name + '"');

    var files = config.files;
    (0, _debug2.default)(files.length + ' files to attach');
    var promises = _underscore2.default.map(files, function (file) {
        return _copyFile(config.s3Bucket, file);
    });

    return _bluebird2.default.all(promises);
}

function _alwaysRetryOnFailure(config) {
    return _attachFiles(config).catch(function (err) {
        output('Attached failed: ' + err);
        return _bluebird2.default.delay(config.attachRetryDelay).then(function () {
            output('Retrying ...');
            return _alwaysRetryOnFailure(config);
        });
    });
}

/* istanbul ignore next */
function inject() {
    var toInject = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    mkdirp = toInject.mkdirp || mkdirp;
    fs = toInject.fs || fs;
    s3 = toInject.s3 || s3;
    output = toInject.output || output;
    verifier = toInject.verifier || verifier;
}
exports.inject = inject;