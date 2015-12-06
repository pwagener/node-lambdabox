'use strict';

var configReader = require('./lib/configReader');
var deployer = require('./lib/deployer');
var attacher = require('./lib/attacher');

function deploy(path) {
    return configReader(path)
        .then(deployer);
}

function attach(path) {
    return configReader(path)
            .then(attacher);
}

module.exports = {

    /**
     * Deploy the lambdabox as specified in 'lambdabox.json'.
     */
    deploy: deploy,

    /**
     * Attach the lambdabox to the running app
     */
    attach: attach
}
