'use strict';

/**
 * This provides a function that synchronously loads JSON from a file path.
 * Using this instead of a raw "require('./some/file.json')" for testability
 * and for ensuring we don't confuse a real dependency with reading an arbitrary
 * file whose path was passed in
 */

import fs from 'fs';

export default function(filePath) {
    var fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents);
}