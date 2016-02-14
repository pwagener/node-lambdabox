#! /usr/bin/env node

'use strict';

/**
 * This module is explicitly ignored by Babel transpiling to easily use
 * the shebang to make it executable.
 */

var util = require('util');

var configReader = require('./configReader').default;
var attach = require('./attacher').default;
var deploy = require('./deployer').default;
var output = require('./output').default;

var command = process.argv[2];
var configPath = process.argv[3];

var commandMap = {
    'deploy': deploy,
    'attach': attach
};

var helpText = 'Usage: lambdabox {attach, deploy} [configFile.json]';

configReader({ config: configPath }).then(function (config) {
    var next = commandMap[command];
    if (next) {
        return next(config);
    } else {
        output(helpText);
        process.exit(1);
    }
}).then(function () {
    output(command + ' complete');
    process.exit(0);
}).catch(function (err) {
    output(command ? command + ' error: ' + util.inspect(err) : helpText);
    process.exit(1);
});