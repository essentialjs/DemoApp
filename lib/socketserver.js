var cookie = require('cookie'),
    socket = require('socket.io'),
    EventEmitter2 = require('eventemitter2').EventEmitter2,
    _ = require('lodash');

module.exports = {
  createServer: function(options) {
    return new SocketServer(options);
  }
};

var SocketServer = function(options) {
  this.options = options || {};
  this.sockets = {};
};

SocketServer.prototype = _.extend(new EventEmitter2({
    wildcard: true,
    delimiter: ':',
    maxListeners: 1000 // default would be 10!
  }), {

  configure: function(fn) {
    fn.call(this);
    return this;
  },

  use: function(module) {
    if (!module) return;

    if (module._connections !== undefined) {
      this.app = module;
    }

    if (module.get && module.clear) {
      this.sessionStore = module;
    }
  },

  _initSocketIO: function() {

    this.io = socket.listen(this.app);

    var self = this;

    // socket.io
    this.io.configure(function() {
      self.io.set('log level', 1);
    });

    this.io.configure('development', function() {
      //self.io.set('log level', 3);

      if (self.options.configureTransports) {
          self.options.configureTransports(self.io);
      } else {
          self.io.set('transports', [
            'websocket'//,
          //'flashsocket'
          ]);
      }
    });

    this.io.configure('production', function() {

      self.io.enable('browser client minification');
      self.io.enable('browser client etag');
      // because of https://github.com/LearnBoost/socket.io/issues/932
      if(!process.platform.match(/^win/)) {
        self.io.enable('browser client gzip');
      }
      self.io.set('log level', 1);

      if (self.options.configureTransports) {
        self.options.configureTransports(self.io);
      } else {
        self.io.set('transports', [
          'websocket',
          'flashsocket',
          'htmlfile',
          'xhr-polling',
          'jsonp-polling'
        ]);
      }

    });

    this.io.set('authorization', function (data, accept) {
      accept(null, true);
    });

    return this;
  },

  start: function(callback) {

    this._initSocketIO();

    var self = this;

    // when a socket connection is opened...
    this.io.sockets.on('connection', function(socket) {
      var hs = socket.handshake;

      var user = hs.sessionID + ': (' + hs.address.address + ":" + hs.address.port + ')';

      self.sockets[socket.id] = socket;

      // when receiving a request...
      socket.on('request', function(data) {
        self.emit('request', socket.id, data);
      });

      // when a clilent disconnects...
      socket.on('disconnect', function () {
        self.emit('disconnect', socket.id);
      });

      // when receiving a command...
      if (self.options.sdkService) {
        socket.on('do', function(data) {
          self.emit('do', data);
        });
      }
    });

    if (self.options.sdkService) {
      this.on('done', function(data) {
        self.io.sockets.emit('done', data);
      });

      this.on('log', function(data) {
        self.io.sockets.emit('log', data);
      });
    }

    this.on('response', function(id, data) {
      // self.io.sockets.emit('response', data);
      if (self.sockets[id]) {
        self.sockets[id].emit('response', data);
      }
    });

    if (callback) callback(null, this.io.sockets);

  }

});