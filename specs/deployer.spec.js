'use strict';

import Promise from 'bluebird';

import deployer, { inject } from '../src/deployer';

const testConfig = {
    "name": "lambdabox-test",
    "s3Bucket": "lambdabox.testbucket",
    "files": [
        {
            path: "specs/testBinaryOne.sh",
            executable: true
        }, {
            path: "specs/testBinaryTwo.sh"
        }
    ]
}


describe('The deployer module', () => {

    it('provides a function', () => {
        expect(deployer).to.be.a('function');
    });

    describe('when called', () => {
        var validConfig, verifier, fs, localS3Store, onSpy, sendSpy;

        beforeEach(() => {
            verifier = sandbox.stub().returns(Promise.resolve());
            fs = {
                createReadStream: sandbox.spy()
            }

            // Mock out raw AWS S3 interface
            onSpy = sandbox.stub();
            localS3Store = {
                upload: sandbox.stub().returns({
                    on: onSpy
                }).callsArg(1)
            };

            inject({
                fs,
                verifier: verifier,
                localS3Store: localS3Store,
                output: sandbox.spy()
            });

            validConfig = JSON.parse(JSON.stringify(testConfig));
            return deployer(validConfig);
        });

        it('verifies the provided config', () => {
            expect(verifier).to.have.been.calledOnce;
        });

        it('creates two ManagedUpload objects', () => {
            expect(localS3Store.upload).to.have.been.calledTwice;
        });

        it('provides the correct S3 params', () => {
            var args = getArgs(localS3Store.upload)[0];

            expect(args).to.have.property('Bucket', testConfig.s3Bucket);
            expect(args).to.have.property('Key', testConfig.files[0].path);
            expect(args).to.have.property('Bucket', testConfig.s3Bucket);
        });
    });

});