'use strict';

import configReader from './configReader';
import deployer from './deployer';
import attacher from './attacher';

function deploy(options) {
    return configReader(options)
        .then(deployer);
}

function attach(options) {
    return configReader(options)
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
