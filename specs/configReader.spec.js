'use strict';

import path from 'path';
import Promise from 'bluebird';

import configReader, { inject } from '../src/configReader';

import testConfig from './testConfig.json';

describe('The configReader module', () => {
    var fs, findParentDir, jsonLoader;

    const fakeConfigDir = '/a/fake/test/dir';

    function initStubs() {
        findParentDir = sandbox.stub().returns(Promise.resolve(fakeConfigDir));
        var configCopy = JSON.parse(JSON.stringify(testConfig));
        jsonLoader = sandbox.stub().returns(configCopy);

        inject({
            output: sandbox.spy(),
            fs: fs,
            findParentDir: findParentDir,
            jsonLoader: jsonLoader
        });
    }

    it('exports a function', () => {
        expect(configReader).to.be.a('function');
    });

    it('errors if it cannot find the config file', done => {
        initStubs();

        // Make findParentDir resolve to null
        inject({
            findParentDir: function() {
                return Promise.resolve(null);
            }
        });
        return configReader().catch(() => {
            done();
        });
    });

    describe('when run with a provided configPath & files', () => {
        var promise;
        const otherConfigPath = 'some/other/path.json';
        beforeEach(() => {
            initStubs();
            promise = configReader({
                config: otherConfigPath,
                files: [
                    'specs/testBinaryOne.sh'
                ]
            });
            return promise;
        });

        it('reads from the specified config path', () => {
            expect(getArgs(jsonLoader)[0]).to.equal(path.resolve(otherConfigPath));
        })

        it('only returns the requested files', () => {
            return promise.then(config => {
                expect(config.files).to.have.length(1);
                expect(config.files[0]).to.have.property('path', 'specs/testBinaryOne.sh');
            });
        });

        it('preserves the other file properties from the config', () => {
            return promise.then(config => {
                var file = config.files[0];
                expect(file).to.have.property('executable', true);
            });
        });
    });

    describe('when run without options', () => {
        var promise;
        beforeEach(() => {
            initStubs();
            promise = configReader();
            return promise;
        });

        it('returns a then-able', () => {
            expect(promise.then).to.be.a('function');
        });

        it('leverages "findParentDir"', () => {
            expect(findParentDir).to.have.been.calledOnce;
        });

        it('looks for "lambdabox.json"', () => {
            expect(getArgs(findParentDir)[1]).to.equal('lambdabox.json');
        });

        it('starts the search at the configReader directory', () => {
            const mochaPath = require.resolve('mocha');
            const mochaBinDir = path.dirname(mochaPath) + '/bin';
            expect(getArgs(findParentDir)[0]).to.equal(mochaBinDir);
        });

        it('loads JSON from the found directory', () => {
            expect(jsonLoader).to.have.been.calledOnce;
            expect(getArgs(jsonLoader)[0]).to.equal(fakeConfigDir + '/lambdabox.json');
        });

        it('resolves to an object', () => {
            return promise.then(result => {
                expect(result).to.be.an('object');
            });
        });

        it('provides the files array on the resolved object', () => {
            return promise.then(result => {
                expect(result.files).to.be.an('array');
            });
        });

        describe('the resulting files', () => {
            var files;
            beforeEach(() => {
                return promise.then(result => {
                    files = result.files;
                });
            });

            it('provides objects for each file', () => {
                for (let file of files) {
                    expect(file).to.be.an('object');
                }
            });

            it('provides a "path" for each file', () => {
                for (let file of files) {
                    expect(file.path).to.be.a('string');
                }
            });

            it('contains the right paths', () => {
                var paths = [];
                for (let file of files) {
                    paths.push(file.path);
                }

                expect(paths).to.contain('specs/testBinaryOne.sh');
                expect(paths).to.contain('specs/testBinaryTwo.sh');
                expect(paths).to.have.length(2);
            });
        });
    });
});

