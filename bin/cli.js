#! /usr/bin/env node
'use strict';

var util = require('util');

var lambdabox = require('../index.js');
var output = require('../lib/output');

var command = process.argv[2];

var configPath = process.argv[3];

if (command === 'deploy') {
    lambdabox.deploy(configPath)
        .then(function() {
            output('Deploy Done');
            process.exit(0);
        }).catch(function(err) {
            output('Deployment error: \n' + util.inspect(err));
            process.exit(1);
        });
} else if (command === 'attach') {
    lambdabox.attach(configPath)
        .then(function() {
            output('Attach Done');
            process.exit(0);
        }).catch(function(err) {
            output('Attach Error: \n' + util.inspect(err));
            process.exit(1);
        });
} else {
    output('No such command: ' + command);
    process.exit(1);
}


