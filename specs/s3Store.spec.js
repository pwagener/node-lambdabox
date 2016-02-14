'use strict';

import s3Store from '../src/s3Store';

describe('The s3Store', function() {

    it('provides an object', () => {
        expect(s3Store).to.be.an('object');
    });

    it('provides Promisified .*Async functions', () => {
        expect(s3Store.putObjectAsync).to.be.a('function');
    });
});