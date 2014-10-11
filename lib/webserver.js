var express = require('express'),
    sockjs = require('sockjs'),
    EventEmitter2 = require('eventemitter2').EventEmitter2,
    i18n = require('i18n'),
    fs = require('fs'),
    _ = require('lodash'),
    cacheDuration = 7 * 24 * 60 * 60 * 1000;

var errorhandler = require('errorhandler'),
    serveStatic = require('serve-static'),
    compression = require('compression'),
    morgan = require('morgan'),
    bodyParser = require('body-parser');

function WebServer() {
  this.app = express();

  this.middlewares = [];
  this.routes = [];
  this.statics = {};

//  this.sessionStore = new express.session.MemoryStore();
};

WebServer.prototype = _.extend(new EventEmitter2({
    wildcard: true,
    delimiter: ':',
    maxListeners: 1000 // default would be 10!
}));

WebServer.prototype.setOptions = function(options) {

  this.options = options || { port: 3000, root: __dirname, sessionKey: 'sessionKey', sessionSecret: 'sessionSecret' };

  if (this.options.hostCertificate) {
    var certOptions = options.hostCertificate;

    if (options.hostCertificate.key) certOptions.key = fs.readFileSync(options.hostCertificate.key);
    if (options.hostCertificate.cert) certOptions.cert = fs.readFileSync(options.hostCertificate.cert);
    if (options.hostCertificate.pfx) certOptions.pfx = fs.readFileSync(options.hostCertificate.pfx);

    if (options.hostCertificate.ca) {
      if (typeof(options.hostCertificate.ca) !== 'string') {
        var certs = [];
        for (var i = 0, len = options.hostCertificate.ca.length; i < len; i++) {
          certs.push(fs.readFileSync(options.hostCertificate.ca[i]));
        }
        certOptions.ca = certs;
      } else {
        certOptions.ca = fs.readFileSync(options.hostCertificate.ca);
      }
    }

    this.certOptions = certOptions;
  }
};


WebServer.prototype.configure = function(fn) {
  fn.call(this);
  return this;
};

WebServer.prototype.use = function(module) {
  if (!module) return;

  // if (module.get && module.clear) {
  //   this.sessionStore = module;
  // }

  if (module.log && module.stream) {
    this.logger = module;
  }
};

WebServer.prototype.addMiddleware = function(middleware) {
  this.middlewares.push(middleware);
};

WebServer.prototype.addRoutes = function(route) {

  if (route instanceof Array) {
    var self = this;
    route.forEach(function(r) {
      self.routes.push(r);
    });
  } else {
    this.routes.push(route);
  }

  return this;
};

WebServer.prototype.addStatics = function(statics) {
  this.statics = statics;

  return this;
};

WebServer.prototype._initExpress = function() {
  var self = this;

  this.app.configure('production', function() {
    self.app.use(compression());
  });

  this.app.configure(function() {

    if (self.logger) {
      self.app.use(morgan({stream: self.logger.stream }));
    } else {
      self.app.use(morgan('dev'));
    }

    self.app.use(bodyParser.json());
    self.app.use(bodyParser.urlencoded({ extended: true }));
    /*TODO
    self.app.use(i18n.handle);
    self.app.use(express.cookieParser(self.options.sessionSecret));
    self.app.use(express.session({
      key: self.options.sessionKey,
      store: self.sessionStore
    }));
  */

    // added middlewares
    for (var i = 0, len = self.middlewares.length; i < len; i++) {
      self.app.use(self.middlewares[i]);
    }

    self.app.set('view engine', 'jade');
    self.app.set('views', self.options.root + '/views');

    if (self.certOptions) {
      self.app.get('*', function(req, res, next) {
        if(!req.secure) {
          var sslRedirectPort = self.options.behindProxy ? '443' : self.options.sslPort;
          return res.redirect('https://' + req.host + ':' + sslRedirectPort + req.url);
        } else {
          next(); /* Continue to other routes if we're not redirecting */
        }
      });
    }

    if (self.options.behindProxy) {
      self.app.enable('trust proxy');
    }

    // i18next
    i18n.registerAppHelper(self.app)
        .serveDynamicResources(self.app);
  });

  // run NODE_ENV=development node server.js
  this.app.configure('development', function() {

    // only parse css in dev - production gets the css pre-minified
    /*self.app.use(stylus.middleware({
      src: self.options.webDirectory + '/assets',
      dest: self.options.webDirectory.replace('/app', '') + '/public',
      compile: compile })
    );*/

    self.app.use(require('node-sass').middleware({
      dest: this.options.assets,
      dest: this.options.assets,
      debug: true,
      outputStyle: 'compressed'
    }))

    self.app.use(errorhandler({ dumpExceptions: true, showStack: true }));
    self.app.use(serveStatic(self.options['public']));
  });

  // run NODE_ENV=production node server.js
  this.app.configure('production', function() {
    self.app.use(errorhandler());
    self.app.use(serveStatic(self.options['public'], {maxAge: cacheDuration}));
  });

  return this;
};

WebServer.prototype.start = function(callback) {
  var self = this;

  this._initExpress();

  // append routes
  this.routes.forEach(function(r) {
    r.actions(self.app, self.options);
  });

  // add statics
  if (this.options.debug) {
    Object.keys(this.statics).sort().reverse().forEach(function(key) {
      self.app.use("/" + key, serveStatic(self.statics[key]));
    });
  } else {
    Object.keys(this.statics).sort().reverse().forEach(function(key) {
      self.app.use("/" + key, serveStatic(self.statics[key], {maxAge: cacheDuration}));
    });
  }

  var http = require('http');
  this.http = http.createServer(this.app);

  if (this.certOptions) {
    var https = require('https');
    this.https = https.createServer(this.certOptions, this.app);
  }

  if (callback) callback(null, this);
};

WebServer.prototype.listen = function() {

  this.http.listen(this.options.servicePort, this.options.host);

  var addition = '';

  if (this.https) {
    this.https.listen(this.options.sslPort, this.options.host);
    addition = ' for http and on port ' + this.options.sslPort + ' for https';
  }

  if (this.logger) { 
    this.logger.log('info', 'Started server on port ' + this.options.servicePort + addition); 
  }
};


module.exports = new WebServer();
