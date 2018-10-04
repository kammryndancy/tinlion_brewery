#!/usr/bin/node

'use strict';

if (require.main === module) {
    const client = require('./client');
    client.run();
} else {
    module.exports = require('./client');
}