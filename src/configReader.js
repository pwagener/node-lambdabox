'use strict';

import Promise from 'bluebird';
import path from 'path';
import _ from 'underscore';
import debug from './debug';

// Variables because we may inject them for tests
import realOutput from './output';
var output = realOutput;

import realFindParentDir from 'find-parent-dir';
var findParentDir = realFindParentDir;
// Promisify this guy for easy management
findParentDir = Promise.promisify(findParentDir);

import realJsonLoader from './jsonLoader';
var jsonLoader = realJsonLoader;

const defaultConfigFileName = 'lambdabox.json';

function _findConfig(options) {
    var configPath = options.configPath;

    if (configPath) {
        output('Finding config with explicit path: ' + configPath);
        return Promise.resolve(path.resolve(configPath));
    } else {
        const startDir = process.cwd();
        output('Searching for ' + defaultConfigFileName + ' starting at ' + startDir);
        return findParentDir(startDir, defaultConfigFileName)
            .then(foundDir => {
                if (foundDir === null) {
                    throw new Error('No configuration file "' + defaultConfigFileName + '" found');
                }
                return path.resolve(foundDir + '/' + defaultConfigFileName);
            }).catch(err => {
                throw err;
            });
    }
}

function _organizeFiles(config, options = {}) {
    let organized = _.map(config.files, current => {
        // Make sure it's an object
        if (typeof current === 'string') {
            current = { path: current }
        }

        // If the options specified files, make sure it's in there too
        if (options.files) {
            const found = _.find(options.files, requestedPath => {
                if (typeof requestedPath === 'object') {
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

    config.files = _.compact(organized);
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
export default function(options = {}) {
    var config = options.config;

    var configPromise;
    if (config) {
        output('Using explicit config: ' + config.name);
        configPromise = Promise.resolve(config);
    } else {
        // find the config by an explicit JSON path or by walking parent dirs
        configPromise =  _findConfig(options)
            .then(configPath => {
                output('Loading configuration from "' + configPath + '"');

                return jsonLoader(configPath);
            });
    }

    return configPromise.then(function(config) {
        _organizeFiles(config, options);
        config.attachRetryDelay = config.attachRetryDelay || 1000
        return config;
    });
}

/**
 * Method to inject dependencies for testing
 * @param toInject The items to inject
 */
function inject(toInject = {}) {
    output = toInject.output || output;
    findParentDir = toInject.findParentDir || findParentDir;
    jsonLoader = toInject.jsonLoader || jsonLoader;
}
export { inject };