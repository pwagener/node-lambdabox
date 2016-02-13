'use strict';

/**
 * This provides a function that synchronously loads JSON from a file path.
 * Using this instead of a raw "require('./some/file.json')" for testability
 * and for ensuring we don't confuse a real dependency with reading an arbitrary
 * file whose path was passed in
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (filePath) {
  var fileContents = _fs2.default.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContents);
};

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }