var async = require('async'),
    _ = require('lodash'),
    i18n = require('i18n'),
    marked = require('marked'),
    jade = require('jade'),
    JSONS = require('json-serialize'),
    webserver = require('../lib/webserver'),
    //socketserver = require('../lib/socketserver'),
    options = require('settings'),
    dive = require('../lib/util/path').dive,
    logger = require('../lib/logging');

// servers
var ws = webserver.createServer(options);

//var ss = socketserver.createServer(options);

async.waterfall([

  function(callback) {
    logger.init(options.logging, options.debug);
    logger.on('log', function(data) {
      //!! ss.emit('log', data);
    });
    callback(null);
  },

  // init commandHandler
  function(callback) {
    dcc.on('log', function(level, msg) {
      logger.log(level, msg);
    });

    dcc.init(options.devicestacksPath, function(err) {
      if (err) return callback(err);

      dcc.on('response', function(sessionId, response) {
        // if (options.debug) {
        //   logger.log('info', 'Send RESPONSE "' + response.event + '" with id: "' + response.id + '" to session: "' + sessionId + '" ==> \n' + JSON.stringify(response, null, 4));
        // } else {
          logger.log('info', 'Send RESPONSE "' + dcc.getEventName(response) + '" with id: "' + response.id + '" to session: "' + sessionId + '"');
        // }
        ss.emit('response', sessionId, response);

        if (options.logging.level === 'debug') {
          ss.emit('log', {
            date: new Date(),
            level: 'debug',
            subLevel: 'response',
            message: response
          });
        }
      });

      ss.on('request', function(sessionId, request) {
        try {
          var req = JSONS.deserialize(request);
          var event = dcc.getEventName(req);
          // if (options.debug) {
          //   logger.log('info', 'Received REQUEST "' + event + '" with id: "' + req.id + '" from session: "' + sessionId + '" ==> \n' + JSON.stringify(req, null, 4));
          // } else {
            logger.log('info', 'Received REQUEST "' + event + '" with id: "' + req.id + '" from session: "' + sessionId + '"');
          // }
          dcc.emit('request', sessionId, req);

          if (options.logging.level === 'debug') {
            ss.emit('log', {
              date: new Date(),
              level: 'debug',
              subLevel: 'request',
              message: req
            });
          }
        } catch(e) {
          logger.log('error', 'Error in handling REQUEST: ==> \n' + JSON.stringify(request));
        }
      });

      ss.on('disconnect', function(sessionId) {
        logger.log('info', 'disconnected client ' + sessionId);
        dcc.cleanup(sessionId);
      });

      callback(null);
    });
  },

  // start sdk
  function(callback) {
    if (options.sdkService) {
      ss.on('do', function(cmd) {
        var doCmd = JSONS.deserialize(cmd);
        switch(doCmd.command) {

          case 'setLogLevel':
            options.logging.level = doCmd.payload;
            ss.emit('done', {
              'event': 'logLevelSet',
              payload: doCmd.payload
            });
            break;

          case 'getCurrentState':
            ss.emit('done', {
              'event': 'currentStateGet',
              payload: {
                level: options.logging.level,
                logBufferSize: options.logging.logBufferSize || 1000,
                logs: logger.buffer
              }
            });
            break;

          case 'setLogBufferSize':
            options.logging.logBufferSize = doCmd.payload;
            ss.emit('done', {
              'event': 'logBufferSizeSet',
              payload: doCmd.payload
            });
            break;
        }
      });

      // clear i18next from cache
      // so sdk will have it's own singleton of i18next
      // IMPORTANT: the ';' in front of delete is not a typo - removing it will make this not work!!!
      for (var m in require.cache) {
        if (m.indexOf('/node_modules/i18next/') > -1) ; delete require.cache[m];
      }

      var sdk = require('dcc-sdk');
      sdk.ws.configure(function() {
        // this.use(sessionStore);
        this.use(logger);
      });

      sdk.init({ socketPort: options.servicePort, path: options.devicestacksPath, only: _.keys(dcc.devicestacks) }, function(err) {
        sdk.listen(options.sdkPort || 3001);
        callback(null);
      });
    } else {
      callback(null);
    }
  },

  // load i18next
  function(callback) {
    // i18next initialisation
    i18n.addPostProcessor('markdown', function(val, key, opts) {
        return marked( val );
    });
    i18n.addPostProcessor('jade', function(val, key, opts) {
        return jade.compile(val, opts)();
    });
    i18n.init({
      load: 'unspecific',
      resGetPath: __dirname + '/../locales/__lng__/__ns__.json',
      ns: { namespaces: ['ns.layout', 'ns.common', 'ns.app'], defaultNS: 'ns.layout' },
      fallbackLng: 'en'
    }, function(t) { callback(null); });
  },

  // load routes
  function(callback) {
    var routes = [];
    dive(__dirname + '/routes', function(err, file) {
      routes.push(require(file));
    }, function() {
      callback(null, routes);
    });
  },

  // load webserver
  function(routes, callback) {
    ws.addRoutes(routes);
    ws.addStatics(options.statics);

    ws.configure(function() {
      // this.use(sessionStore);
      this.use(logger);
    }).start(callback);
  },

  // load socketserver
  function(ws, callback) {
    ss.configure(function() {
        // this.use(sessionStore);
        this.use(ws.https || ws.http);
    }).start(callback);
  }//,

],
// finally
function(err) {
  if (err) {
    var addition = '';
    if (err.name) {
      addition += ': ' + err.name;
      if (err.messge) {
        addition += ' "' + err.messge + '"';
      }
    }
    logger.log('error', 'Error starting server' + addition);
    throw err;
  }

  ws.listen();
});
