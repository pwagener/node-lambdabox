'use strict';

var _configReader = require('./configReader');

var _configReader2 = _interopRequireDefault(_configReader);

var _deployer = require('./deployer');

var _deployer2 = _interopRequireDefault(_deployer);

var _attacher = require('./attacher');

var _attacher2 = _interopRequireDefault(_attacher);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function deploy(options) {
    return (0, _configReader2.default)(options).then(_deployer2.default);
}

function attach(options) {
    return (0, _configReader2.default)(options).then(_attacher2.default);
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
};