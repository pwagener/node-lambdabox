'use strict';

var Promise = require('bluebird');
var path = require('path');
var fs = require('fs');

var debug = require('./debug');



function _findSidecarConfig(configPath) {
    if (!configPath) {
        // Otherwise, start at the CWD and work our way upwards
        configPath = process.cwd() + '/lambdabox.json';
        var found = fs.existsSync(configPath);

        while (!found) {
            var directory = path.dirname(configPath) + '/..';
            if (!fs.existsSync(directory)) {
                break;
            }

            configPath = path.resolve(directory + '/lambdabox.json');
            found = fs.existsSync(configPath);
        }

        if (found) {
            return configPath;
        } else {
            throw new Error('Cannot find "lambdabox.json"');
        }
    }

    return path.resolve(configPath);
}

module.exports = function(configPath) {
    configPath = _findSidecarConfig(configPath);

    debug('Loading configuration from "' + configPath + '"');
    return new Promise(function(resolve) {
        var lambdaboxConfig = require(configPath);
        resolve(lambdaboxConfig);
    });
}