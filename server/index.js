
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
  code: ['libs/jquery.min.js', 'app'],
  tmpl: '*'
});

// Serve this client on the root URL
ss.http.route('/discuss', function(req, res){
  res.serveClient('discuss');
});

// Code Formatters
ss.client.formatters.add(require('ss-sass'));

// HTML template formatters
ss.client.formatters.add(require('ss-jade'),{
	locals: {} // extra variables
	// headers {}
});

// Use server-side compiled Hogan (Mustache) templates. Others engines available
ss.client.templateEngine.use(require('ss-hogan'));

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
