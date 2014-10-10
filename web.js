/*
    The script to run the server-side which will host the site/client content and live app
*/
var path = require('path'),
    fs = require('fs'),
    existsSync = fs.existsSync || path.existsSync;

if (!existsSync(path.join(__dirname, 'server/index.js'))) {
  module.exports = require('./dist/server');
} else {
  module.exports = require('./server');
}
