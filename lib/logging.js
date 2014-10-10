var winston = require('winston'),
    _ = require('lodash'),
    EventEmitter2 = require('eventemitter2').EventEmitter2,
    logger,
    debug,
    customLevels,
    self;

module.exports = self = _.extend(new EventEmitter2({
    wildcard: true,
    delimiter: ':',
    maxListeners: 1000 // default would be 10!
  }), {

  init: function(options, isDebug) {

    debug = isDebug;

    options = options || {};

    var defaults = {
      timestamp: true,
      // filename: __dirname + '/../log.log',
      level: 'info',
      colorize: true,
      datePattern: '.yyyy-MM-dd',
      maxFiles: 5,
      maxsize: 20000
    };

    _.defaults(options, defaults);

    self.options = options;

    customLevels = [
      'device',
      'framehandler',
      'connection',
      'command',
      'task',
      'deviceloader',
      'deviceguider'
    ];

    self.levels = _.keys(winston.levels);

    logger = new (winston.Logger)({
      transports: [
        new (winston.transports.Console)(options)
      ]
    });

    if (options.filename) {
      var fileOptions = _.clone(options);
      fileOptions.json = false;
      fileOptions.colorize = false;
      logger.add(winston.transports.DailyRotateFile || winston.transports.File, fileOptions);
    }

    self.logger = logger;

    self.buffer = [];
  },

  log: function() {
    var level,
        message,
        subLevel,
        winstonArgs;

    if (arguments.length > 0 && customLevels.indexOf(arguments[0]) >= 0) {
      var args = _.toArray(arguments);
      args[1] = args[0] + ' | ' + args[1];
      args[0] = 'debug';
      winstonArgs = args;
      level = 'debug';
      subLevel = arguments[0];
      message = _.toArray(arguments).slice(1).join(' ');
    } else {
      winstonArgs = arguments;
      level = arguments[0];
      message = _.toArray(arguments).slice(1).join(' ');
    }

    var index = self.levels.indexOf(self.options.level);

    if (index < 0) {
      index = self.levels.indexOf('error');
    }

    var indexOfLog = self.levels.indexOf(level);

    if (indexOfLog >= index) {
      logger.log.apply(logger, winstonArgs);

      var entry = {
        date: new Date(),
        level: level,
        message: message,
        subLevel: subLevel
      };

      self.buffer.push(entry);

      if (self.buffer.length > self.options.logBufferSize) {
        self.buffer = self.buffer.slice(self.buffer.length - self.options.logBufferSize);
      }

      self.emit('log', entry);
    }
  },

  stream: {
    write: function(str) {
      // if (!debug) {
      //   logger.info(str);
      // }
    }
  }

});
