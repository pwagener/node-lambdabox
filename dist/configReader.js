'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.inject = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

// Variables because we may inject them for tests


exports.default = function () {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var config = options.config;

    var configPromise;
    if (config) {
        output('Using explicit config: ' + config.name);
        configPromise = _bluebird2.default.resolve(config);
    } else {
        // find the config by an explicit JSON path or by walking parent dirs
        configPromise = _findConfig(options).then(function (configPath) {
            output('Loading configuration from "' + configPath + '"');

            return jsonLoader(configPath);
        });
    }

    return configPromise.then(function (config) {
        _organizeFiles(config, options);
        config.attachRetryDelay = config.attachRetryDelay || 1000;
        return config;
    });
};

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _debug = require('./debug');

var _debug2 = _interopRequireDefault(_debug);

var _output = require('./output');

var _output2 = _interopRequireDefault(_output);

var _findParentDir = require('find-parent-dir');

var _findParentDir2 = _interopRequireDefault(_findParentDir);

var _jsonLoader = require('./jsonLoader');

var _jsonLoader2 = _interopRequireDefault(_jsonLoader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var output = _output2.default;

var findParentDir = _findParentDir2.default;
// Promisify this guy for easy management
findParentDir = _bluebird2.default.promisify(findParentDir);

var jsonLoader = _jsonLoader2.default;

var defaultConfigFileName = 'lambdabox.json';

function _findConfig(options) {
    var configPath = options.configPath;

    if (configPath) {
        output('Finding config with explicit path: ' + configPath);
        return _bluebird2.default.resolve(_path2.default.resolve(configPath));
    } else {
        var startDir = process.cwd();
        output('Searching for ' + defaultConfigFileName + ' starting at ' + startDir);
        return findParentDir(startDir, defaultConfigFileName).then(function (foundDir) {
            if (foundDir === null) {
                throw new Error('No configuration file "' + defaultConfigFileName + '" found');
            }
            return _path2.default.resolve(foundDir + '/' + defaultConfigFileName);
        }).catch(function (err) {
            throw err;
        });
    }
}

function _organizeFiles(config) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var organized = _underscore2.default.map(config.files, function (current) {
        // Make sure it's an object
        if (typeof current === 'string') {
            current = { path: current };
        }

        // If the options specified files, make sure it's in there too
        if (options.files) {
            var found = _underscore2.default.find(options.files, function (requestedPath) {
                if ((typeof requestedPath === 'undefined' ? 'undefined' : _typeof(requestedPath)) === 'object') {
                    requestedPath = requestedPath.path;
                }

                return requestedPath === current.path;
            });

            if (!found) {
                current = null;
            }
        }

        return current;
    });

    config.files = _underscore2.default.compact(organized);
}

/**
 * The config reader finds the 'lambdabox.json' file, interprets it, and
 * resolves to an object representing the config.
 * @param options Options.  May include:
 *   - files The array of files to be concerned with
 *   - config The configuration object to use
 *   - configPath The path to the configuration file
 * @returns {Promise.<T>}
 */


/**
 * Method to inject dependencies for testing
 * @param toInject The items to inject
 */
function inject() {
    var toInject = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    output = toInject.output || output;
    findParentDir = toInject.findParentDir || findParentDir;
    jsonLoader = toInject.jsonLoader || jsonLoader;
}
exports.inject = inject;