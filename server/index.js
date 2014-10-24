
// My SocketStream 0.3 app

var http = require('http'),
	path = require('path'),
    ss = require('socketstream');

ss.client.options.dirs.static = "/site";
ss.client.options.dirs.assets = "/site/assets";

// Define a single-page client called 'discuss'
ss.client.define('discuss', {
  view: 'discuss.jade',
  css:  ['libs/reset.css', 'discuss.scss'],
  code: [/*'libs/angular.js',*/ 'app', 'system'],
  tmpl: '*'
});

// Serve this client on the root URL
ss.http.route('/discuss', function(req, res){
  res.serveClient('discuss');
});

ss.session.options.maxAge = 2.6*Math.pow(10,9);

// Code Formatters
ss.client.formatters.add(require('ss-sass'));

// HTML template formatters
ss.client.formatters.add(require('../lib/ss/jade'),{
    basedir: path.join(__dirname,"../lib"),
	locals: {} // extra variables
	// headers {}
});

// Use server-side compiled Angular templates.
ss.client.templateEngine.use('angular');

// respond with angular content
ss.responders.add(require('../lib/ss/angular/server'),{pollFreq: 1000});


ss.ws.transport.use(require('ss-sockjs'), {
	client: {
		// debug: (ss.env === 'production')
	},
	server: {
		// log: function(severity,message) {
		// 	console.log("custom log:::", severity, message);
		// }
	}
});

// Minimize and pack assets if you type: SS_ENV=production node app.js
if (ss.env === 'production') ss.client.packAssets();
else {
	// var jadeware = require("../lib/util/jadeware");
	// ss.http.middleware.prepend(jadeware({
	// 	debug: true,
	// 	base_dir: path.join(__dirname,".."),
	// 	vars: {},
	// 	src: ss.client.options.dirs.static
	// }));
}

// Start web server
var server = http.Server(ss.http.middleware);
server.listen(3000);

//TODO configurable port
//TODO config SSL

// Start SocketStream
ss.start(server);
