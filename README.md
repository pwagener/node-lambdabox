# Node Lambdabox

Is your AWS Lambda written in Node too fat to fit under the 50 MB limit?  Then
you have two choices:

1.  Put it on a diet
2.  Put some of it in a Lambdabox

No one likes a diet; so let's talk about #2.

## Installation

```
npm install lambdabox
```

## What Is This Good For?

If your AWS Lambda uses ...

* Data files that would exceed the 50 MB limit
* Binaries that must be compiled for AWS Linux


... then this project might help.

A Lambdabox is a set of files stored in S3 that can easily be used by your
Lambda.  This project includes tools to make it easy to store files in S3 and
then attach them to the EC2 instance that is executing your Lambda at runtime.

Here are the basic steps:

1.  Create a `lambdabox.json` configuration file in your project's root directory
2.  Deploy you Lambdabox to S3 with the included CLI or by modifying your build process
3.  Attach your Lambdabox via your Lambda's entry module

## Seriously?

Yeah, seriously.  A Lambda [is guaranteed 512 MB of storage](http://docs.aws.amazon.com/lambda/latest/dg/limits.html)
in `/tmp` that it can use however it sees fit.  Copying files from S3 into the running instance takes a few hundred
milliseconds.  For certain types of workloads, this is a small price to pay to get around the 50 MB
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
    "data/anotherBigFile.csv",
    { "path": "bin/aws-linux/phantomjs", "executable": true }
  ]
}
```

The lambdabox needs a logical name, the S3 bucket to store the files in, and
the list of files to be inclued in this lambdabox. The list of files can be
strings or as objects with a `path` property.  You also can specify `executable`
as `true` if you need the file to be executable when it is copied over.

When deployed, this lambdabox will upload all the files to the S3 bucket named
`my.s3.bucket.lambdabox` using the locally-available AWS credentials and the
relative paths.


## Step #2: Deploying Your Lambdabox

Deploying your Lambdabox means copying everything up to the specified S3 bucket
where it can be used by a running AWS Lambda function.  There are several ways
to do this, depending on how your project is structured.

### Easiest Deploy Option: Use npm scripts

The `lambdabox` NPM module provides a CLI you can leverage as an NPM script.
In your `package.json`, reference it like:

```json
{
    "scripts": {
        "lambdabox": "lambdabox deploy"
    }
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
be done outside of your _handler(...)_ method so it only runs once per instance.

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
files we need in `/tmp`. The `Promise` returned from `lambdabox.attach()` is
never rejected.  If the copy fails (for instance, the file does not exist in
S3), Lambdabox will retry again after a delay.  This is to ensure future calls
to the _handler(...)_ do not proceed without having the files available.


### lambdabox.attach(...) options

#### Specifying Files
Different Lambda's may not need all files.  You may specify the files
needed by the particular lambda in the `attach` call with the `files` option:

```
    // ...
    var attachPromise = lambdabox.attach({
        files: [
            "data/someBigFile.csv",
            "data/anotherBigFile.csv"
        ]
    });
```
This call to `attach(...)` would not copy the PhantomJS executable from the
configuration file.

### Working With Bundlers
When using `webpack` or `browserify` to package your Lambda, it may be
troublesome to have an external `lambabox.json` file lying around not specified
as part of the dependency tree.  In your handler you can explicitly
load the configuration file via `require(...)`, and then provide it directly to
the `attach(...)` call with the `config` option.  For instance:

```
// Use Lambdabox to ensure we have PhantomJS
var lambdabox = require('lambdabox');
var lambdaboxConfig = require('./lambdabox.json');
var attachPromise = lambdabox.attach({
    config: lambdaboxConfig
});
```
This would allow a bundler like `webpack` to package the configuration inside
of the built file.  That configuration would then be provided directly to
`lambdabox`.

# Changelog

See [the ChangeLog](./Changes.md) for details.