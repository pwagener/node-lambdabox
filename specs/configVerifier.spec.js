'use strict';

import Promise from 'bluebird';
import _ from 'underscore';

import configVerifier, { inject } from '../src/configVerifier';


describe('The configVerifier module', () => {
    var validConfig;

    beforeEach(() => {
        validConfig = JSON.parse(JSON.stringify(require('./testConfig.json')));
    });

    it('exports a function', () => {
        expect(configVerifier).to.be.a('function');
    });

    it('rejects if provided a null configuration', done => {
        return configVerifier(null).catch(() => {
            done();
        });
    });

    it('rejects if not provided a configuration name', done => {
        return configVerifier(_.omit(validConfig, 'name')).catch(() => {
            done();
        });
    });

    it('rejects if not provided an S3 bucket', done => {
        return configVerifier(_.omit(validConfig, 's3Bucket')).catch(() => {
            done();
        });
    });

    describe('when verifying a valid config', () => {
        var promise, s3, output;

        beforeEach(() => {
            output = sandbox.spy();
            s3 = {
                headBucketAsync: sandbox.stub().returns(Promise.resolve({}))
            }

            inject({
                s3: s3,
                output: output
            });

            promise = configVerifier(validConfig);
            return promise;
        });

        it('issues a HEAD request', () => {
            expect(s3.headBucketAsync).to.have.been.calledOnce;
        });

        it('uses the requested bucket', () => {
            var arg = getArgs(s3.headBucketAsync)[0];
            expect(arg).to.have.property('Bucket', validConfig.s3Bucket);
        });

        it('rejects if the S3 call fails', done => {
            promise.cancel();
            s3.headBucketAsync = sandbox.stub().returns(Promise.reject(new Error('Test error')));
            return configVerifier(validConfig).catch(() => {
                done();
            });
        });
    });
});
