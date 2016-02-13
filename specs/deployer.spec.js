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
        var validConfig, verifier, fs, AWSManagedUpload, onSpy, sendSpy;

        beforeEach(() => {
            verifier = sandbox.stub().returns(Promise.resolve());
            fs = {
                createReadStream: sandbox.spy()
            }

            // Mock out AWSManagedUpload
            AWSManagedUpload = sandbox.stub();
            AWSManagedUpload.prototype.on = onSpy = sandbox.spy();
            AWSManagedUpload.prototype.send = sendSpy = sandbox.stub().callsArgWith(0, null, {});
            const AWS = {
                S3: {
                    ManagedUpload: AWSManagedUpload
                }
            };

            inject({
                fs,
                verifier: verifier,
                AWS: AWS,
                output: sandbox.spy()
            });

            validConfig = JSON.parse(JSON.stringify(testConfig));
            return deployer(validConfig);
        });

        it('verifies the provided config', () => {
            expect(verifier).to.have.been.calledOnce;
        });

        it('creates two ManagedUpload objects', () => {
            expect(AWSManagedUpload).to.have.been.calledTwice;
        });

        it('provides the service to use', () => {
            expect(getArgs(AWSManagedUpload)[0]).to.have.property('service');
        });

        it('provides the correct S3 params', () => {
            var args = getArgs(AWSManagedUpload)[0];
            expect(args).to.have.property('params');

            expect(args.params).to.have.property('Bucket', testConfig.s3Bucket);
            expect(args.params).to.have.property('Key', testConfig.files[0].path);
            expect(args.params).to.have.property('Bucket', testConfig.s3Bucket);
        });
    });

});