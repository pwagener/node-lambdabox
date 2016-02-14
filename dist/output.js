'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (msg) {
  target.log('[lambdabox] :: ' + msg);
};

var target = console;

/**
 * Print a message to the output
 * @param msg The message to print
 */


/**
 * Method to inject dependencies into here.  Used for testing.
 * @param toInject Items to inject.
 */
var inject = function inject() {
  var toInject = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  target = toInject.target;
};

exports.inject = inject;