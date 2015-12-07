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

If your AWS Lambda uses ...

* Large data files that would exceed the 50 MB limit
* Binaries that must be compiled for AWS Linux
* (Not Yet, But Soon) Native node modules that you must rebuild for AWS Linux

... then this project might help.

A Lambdabox is a set of files stored in S3 that can easily be used by your
Lambda.  This project includes tools to make it easy to store files in S3 and
then attach them to the EC2 instance that is executing your Lambda at runtime.

Here are the basic steps:

1.  Create a `lambdabox.json` configuration file in your project's root directory
2.  Deploy you Lambdabox to S3 with the included CLI or by modifying your build process
3.  Attach your Lambda box via your Lambda's entry module

## Seriously?

Yeah, seriously.  A Lambda [is guaranteed 512 MB of storage](http://docs.aws.amazon.com/lambda/latest/dg/limits.html)
in `/tmp` that it can use however it sees fit.  Copying files from S3 into the running instance takes a few hundred
milliseconds.  For certain types of Lambdas workloads, this is a small price to pay to get around the 50 MB
deployment limit.

Even better news:  Amazon [tells us the Lambda container
lifecycle](https://aws.amazon.com/blogs/compute/container-reuse-in-lambda/) will
ensure that when a container is reused, anything in `/tmp` will still be there.
Our recommended Lambdabox attach pattern (see #3 below) takes advantage of this.
If your Lambda is in "regular use", then you'll only pay the S3 copy price once.

## Step #1: The lambdabox.json Configuration File
This describes what your Lambdabox will contain.  One simple example:

```json
{
  "name": "my-lambdabox",
  "s3Bucket": "my.s3.bucket.lambdabox",
  "files": [
    "data/someBigFile.csv",
    { "path": "bin/aws-linux/phantomjs", "executable": true }
  ]
}
```

You can provide the list of files either as direct strings or as objects
with a `path` property.  You also can specify `executable` if you expect the
file to be executable when it is copied over.

Storing binaries in a Lambdabox is a typical use case:  the binaries have to
be compiled for AWS Linux, making them typically not useful for local testing
but imperative for leveraging in a deployed Lambda.  When deployed, this
configuration would take the files at `bin/aws-linux/phantomjs` and
`data/someBigFile.csv` and upload them to the S3 bucket named
`my.s3.bucket.lambdabox` using the locally-available AWS credentials.


## Step #2: Deploying Your Lambdabox

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


## Step #3: Modifying Your Lambda's Entry Module

Finally, you have to modify how your Lambda runs to "attach" the Lambdabox at runtime.  This should
be done outside of your _handler()_ method, it only runs once per instance.

```js
var lambdabox = require('lambdabox');
var attachPromise = lambdabox.attach();

// Lambda Handler
module.exports.handler = function(event, context) {
    attachPromise.then(function() {
        console.log('/tmp/bin/aws-linux/phantomjs should now exist and be executable');
        context.done();
    }).catch(function(err) {
        context.done(err);
    });
};

```

The `lambdabox.attach()` method returns a Promise that resolves when the
Lambdabox has been completely copied to the instance.  Since the Node
initialization code only runs once per instance, we're guaranteed to have the
files we need in `/tmp`.
