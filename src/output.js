'use strict';

var target = console;

/**
 * Print a message to the output
 * @param msg The message to print
 */
export default function(msg) {
    target.log('[lambdabox] :: ' + msg);
}

/**
 * Method to inject dependencies into here.  Used for testing.
 * @param toInject Items to inject.
 */
var inject = function(toInject = {}) {
    target = toInject.target;
};

export { inject };