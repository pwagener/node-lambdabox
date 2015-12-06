# Node Lambdabox

Is your AWS Lambda written in Node too fat to fit under the 50 MB limit?  Then
you have two choices:

1.  Put it on a diet
2.  Put some of it in a Lambdabox

Let's face it: no one likes a diet; so on to #2.

## Installation

```
npm install lambdabox
```

## What Is This Good For?

An AWS Lambda must be less than 50 MB.  If your Lambda includes big fat files,
that might be tough to meet.  A Lambdabox is a set of files stored in S3 that
can be used by your Lambda.  This project includes tools to make it easy to
store files in S3 and then attach them to your Lambda at runtime.

Here are the broad steps:

1.  Create the `lambdabox.json` configuration file in your project's root directory.
2.  Deploy you Lambdabox to S3 with the included CLI or by modifying your build
process
3.  Modify your Lambda's entry module to attach the Lambdabox at runtime
outside of your `handler` function.



## The lambdabox.json Configuration File
This file describes what your box will contain.  One simple example:

```json
{
  "name": "my-lambdabox",
  "bucket": "my.s3.bucket.lambdabox",
  "binaries": [
    { "path": "bin/aws-linux/phantomjs" }
  ]
}
```

Storing binaries in a Lambdabox is a typical use case:  the binaries have to
be compiled for AWS Linux, making them typically not useful for local testing
but imperative for leveraging in a deployed Lambda.  When deployed, this
configuration would take the file at `bin/aws-linux/phantomjs` and upload it
to the S3 bucket named `my.s3.bucket.lambdabox` using the locally-available
AWS credentials.

## Deploying Your Lambdabox

Deploying your Lambdabox means copying everything up to the specified S3 bucket
where it can be used by a running AWS Lambda function.  There are several ways
to do this, depending on how your project is structured.

### Easiest Deploy Option: Use npm scripts

The `lambdabox` NPM module provides a CLI you can leverage as an NPM script.
In your `package.json`, reference it like:

```json
    "scripts": {
        "lambdabox": "lambdabox deploy"
    }
```

Then run it:

```bash
$ npm run lambdabox
```

### Alternate Easy Deploy Option:  Global install & call the CLI directly

You can also install Lambdabox globally, and then run the included CLI yourself:

```bash
$ npm install -g lambdabox
...
$ lambdabox deploy
```

### Gulp/Grunt Deploy Option: DIY Module Use

You may also include the Lambdabox module in your own Gulp/Grunt deploy code.
A gulp task that would deploy your Lambdabox would look something like:

```js
var lambdabox = require('lambdabox');
var gulp = require('gulp');


gulp.task('lambdaDeploy', function () {
    lambdabox.deploy();
});

```


## Modifying Your Lambda's Entry Module

Finally, you have to modify how your Lambda runs to "attach" the Lambdabox at runtime.  This should
be done outside of your _handler()_ method, it only runs once per instance.

```js
var lambdabox = require('lambdabox');
var attachPromise = lambdabox.attach();

// Lambda Handler
module.exports.handler = function(event, context) {
    attachPromise.then(function() {
        console.log('/tmp/bin/aws-linux/phantomjs should now exist and be executable');
    }).catch(function(err) {
        context.done(err);
    });
};

```