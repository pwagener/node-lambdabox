'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import chaiString from 'chai-string';
chai.use(sinonChai);
chai.use(chaiString);

global.expect = chai.expect;

// Enable cancelation
import Promise from 'bluebird';
Promise.config({
    cancellation: true
})

/**
 * Utility method to get the arugments for a given stub
 * @param stub The stub
 * @param callNum The call number; defaults to 0
 * @returns {[]} The array of arguments to that call
 */
global.getArgs = function(stub, callNum = 0) {
    return stub.getCall(callNum).args;
}

beforeEach(function () {
    global.sandbox = sinon.sandbox.create();
});

afterEach(function () {
    global.sandbox.restore();
});