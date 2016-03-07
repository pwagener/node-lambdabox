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
        var validConfig, verifier, fs, rawS3, onSpy, sendSpy;

        beforeEach(() => {
            verifier = sandbox.stub().returns(Promise.resolve());
            fs = {
                createReadStream: sandbox.spy()
            }

            // Mock out raw AWS S3 interface
            onSpy = sandbox.stub();
            rawS3 = {
                upload: sandbox.stub().returns({
                    on: onSpy
                }).callsArg(1)
            };

            inject({
                fs,
                verifier: verifier,
                rawS3: rawS3,
                output: sandbox.spy()
            });

            validConfig = JSON.parse(JSON.stringify(testConfig));
            return deployer(validConfig);
        });

        it('verifies the provided config', () => {
            expect(verifier).to.have.been.calledOnce;
        });

        it('creates two ManagedUpload objects', () => {
            expect(rawS3.upload).to.have.been.calledTwice;
        });

        it('provides the correct S3 params', () => {
            var args = getArgs(rawS3.upload)[0];

            expect(args).to.have.property('Bucket', testConfig.s3Bucket);
            expect(args).to.have.property('Key', testConfig.files[0].path);
            expect(args).to.have.property('Bucket', testConfig.s3Bucket);
        });
    });

});