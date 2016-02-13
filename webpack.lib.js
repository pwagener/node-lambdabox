'use strict';

// A webpack configuration for bundling.  Not yet utilized, as it falls
// over trying to deal with the AWS SDK

var webpack = require("webpack");
var path = require('path');

var uglifyJsPlugin = new webpack.optimize.UglifyJsPlugin({
    compress: {
        warnings: false
    },
    'screw-ie8': true
});

var babelifySrcLoader = {
    test: /\.js$/,
    include: path.resolve(__dirname, "src"),
    // NOTE:  the es2015 preset is in 'package.json', not here
    loader: "babel-loader?cacheDirectory"
}

module.exports = {
    target: 'node',
    entry: './src/index',
    output: {
        path: __dirname + "/dist",
        filename: "lambdabox.js"
    },

    plugins: [
        // The AWS SDK must be provided externally
        new webpack.IgnorePlugin(/aws-sdk/),

        uglifyJsPlugin
    ],

    module: {
        loaders: [ babelifySrcLoader ]
    }
}



// These are rumored to make it possible to webpack the AWS SDK
var jsonLoader = {
    test: /\.json$/, loader: 'json'
}
var awsSdkLoader = {
    test: /aws-sdk/,
    loaders: [ "transform?brfs" ]
}
