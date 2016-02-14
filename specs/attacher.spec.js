'use strict';

import Promise from 'bluebird';
import attacher, { inject } from '../src/attacher';

const testConfig = {
    "name": "lambdabox-test",
    "s3Bucket": "lambdabox.testbucket",
    "attachRetryDelay": 50,
    "files": [
        {
            path: "specs/testBinaryOne.sh",
            executable: true
        }, {
            path: "specs/testBinaryTwo.sh"
        }
    ]
}
const testContentBody1 = 'Test Body 1';
const testContentBody2 = 'Test Body 2';

describe('The attacher module', () => {
    let promise, validConfig, verifier, s3, fs, mkdirp;

    it('provides a function', () => {
        expect(attacher).to.be.a('function');
    });

    // Utility method to stub out the attacher
    var injectNewStubs = function() {
        validConfig = JSON.parse(JSON.stringify(testConfig));
        verifier = sandbox.stub().returns(Promise.resolve(validConfig));

        var getObjStub = sandbox.stub();
        getObjStub.onCall(0).returns(Promise.resolve({
            Body: testContentBody1
        }));
        getObjStub.returns(Promise.resolve({
            Body: testContentBody2
        }));

        s3 = {
            getObjectAsync: getObjStub
        };
        fs = {
            writeFileSync: sandbox.spy()
        };

        mkdirp = sandbox.stub().returns(Promise.resolve());

        inject({
            verifier: verifier,
            s3: s3,
            fs: fs,
            mkdirp: mkdirp,
            output: sandbox.spy()
        });
    }

    describe('when called', () => {
        beforeEach(() => {
            injectNewStubs();
            return promise = attacher(validConfig);
        });

        it('verifies the provided config', () => {
            expect(verifier).to.have.been.calledOnce
                    .and.to.have.been.calledWith(validConfig);
        });

        it('creates the necessary directories', () => {
            expect(mkdirp).to.have.been.calledTwice
                    .and.to.have.always.been.calledWith('/tmp/specs');
        });

        it('retrieves content from s3', () => {
            expect(s3.getObjectAsync)
                    .to.have.been.calledTwice
                    .and.to.have.been.calledWith({
                        Bucket: validConfig.s3Bucket,
                        Key: validConfig.files[0].path
                    })
                    .and.to.have.been.calledWith({
                        Bucket: validConfig.s3Bucket,
                        Key: validConfig.files[1].path
                    });
        });

        it('writes content to the filesystem', () => {
            expect(fs.writeFileSync)
                    .to.have.been.calledTwice
                    .and.to.have.been.calledWith('/tmp/specs/testBinaryOne.sh', testContentBody1, { encoding: 'binary', mode: 16832 })
                    .and.to.have.been.calledWith('/tmp/specs/testBinaryTwo.sh', testContentBody2, { encoding: 'binary' })
        });
    });

    describe('when called and it initially fails', () => {
        beforeEach(() => {
            injectNewStubs();

            // Make sure getObjectAsync fails the first two times
            const failingS3Stub = sandbox.stub();
            failingS3Stub.onCall(0).returns(Promise.reject(new Error('S3 is Broken!')));
            failingS3Stub.onCall(1).returns(Promise.reject(new Error('S3 is still Broken!')));
            failingS3Stub.returns(Promise.resolve({
                Body: testContentBody2
            }));

            inject({
                s3: {
                    getObjectAsync: failingS3Stub
                }
            });
        });

        it('resolves the promise after it succeeds', () => {
            return attacher(validConfig);
        });
    });

});