var async = require('async'),
    _ = require('lodash'),
    i18n = require('i18n'),
    marked = require('marked'),
    jade = require('jade'),
    JSONS = require('json-serialize'),
    webserver = require('../lib/webserver'),
    //socketserver = require('../lib/socketserver'),
    options = require('./settings'),
    routes = require('./routes'),
    user = require('./routes/user'),
    dive = require('../lib/util/path').dive,
    logger = require('../lib/logging');

// servers
webserver.setOptions(options);


async.waterfall([

  // logging triggers events
  function(callback) {
    logger.init(options.logging, options.debug);
    logger.on('log', function(data) {
      webserver.emit('log', data);
    });
    callback(null);
  }/*,


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
    webserver.addRoutes(routes);
    webserver.addStatics(options.statics);

    webserver.configure(function() {
      // this.use(sessionStore);
      this.use(logger);
    }).start(callback);
  },

  // load socketserver
  function(ws, callback) {
    ss.configure(function() {
        // this.use(sessionStore);
        this.use(webserver.https || webserver.http);
    }).start(callback);
  }//,

  */

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

  webserver.listen();
});
