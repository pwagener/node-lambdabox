'use strict';

import output, {inject} from '../src/output';

describe('When using the output module', () => {
    var consoleSpy;
    beforeEach(() => {
        consoleSpy = {
            log: sandbox.spy()
        };
        inject({ target: consoleSpy });

        output('Something');
    });

    it('returns a function', () => {
        expect(output).to.be.a('function');
    });

    it('logs to the specified output', () => {
        expect(consoleSpy.log).to.be.calledOnce;
    });

    it('prepends "[lambdabox]" to anything', () => {
        var arg = consoleSpy.log.getCall(0).args[0];
        expect(arg).to.startWith('[lambdabox]');
    });
});