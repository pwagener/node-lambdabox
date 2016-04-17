# Change Log

This project follows semantic versioning.  Each release will document changes here.

## 2.0.0
Breaking Change:
- When calling `attach()`, replaced the `config` option with `configPath`
to specify the path to the Lambdabox configuration file.  The `config` options
is now used to directly provide the config object.

## 1.1.2:

- Fixed bug in finding `lambdabox.json` file

## 1.1.0:

- Ability to specify files to `attach`
- Use multipart uploads for `deploy`
- The `attach` Promise auto-retry
- ES6/Babelify the code
- Tests


## 1.0.0

Initial Release
