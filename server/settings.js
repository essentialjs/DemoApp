var fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    iniparser = require('iniparser');

var settings = {
  title: 'demoapp',
  version: require('./package.json').version,
  setupVersion: 'directly from source',
  // host: 'localhost',
  webPort: 4400,
  // sslPort: 5001,
  // hostCertificate: {
  //   key: __dirname + '/cert.key',
  //   cert: __dirname + '/cert.crt',
  //   passphrase: '1234'
  // },
  // logging: { filename: __dirname + '/log.log' },
  logging: { level: 'debug', logBufferSize: 1000 },
  sdkService: true,
  devicestacksPath: __dirname + '/node_modules',
  lngs: getLanguages(),
  debug: (process.env.NODE_ENV !== 'production' || process.env.DEBUG) ? true : false
};

settings.uri = 'http://' + settings.host + ':' + settings.servicePort;
settings.sessionSecret = settings.title;
settings.sessionKey = settings.title + '.sid';
settings.root = __dirname;

settings.statics = {
  'app': settings.root + '/client/app',
  'app/templates': settings.root + '/client/assets/templates',
  'assets': settings.root + '/client/assets',
  'js': settings.root + '/client/assets/js'
};

if (process.env.NODE_ENV == 'production') {

  settings.logging.level = 'error';

  settings.devicestacksPath = __dirname + '/node_modules';

  settings.host = 'localhost';
  // settings.servicePort = 80;
  // settings.sslPort = 443; // if 443 the process must be started as sudo

  // settings.hostCertificate = {
  //   key: __dirname + '/cert.key',
  //   cert: __dirname + '/cert.crt',
  //   passphrase: '1234'
  // };

  settings.statics = {
    'app': settings.root + '/client/dist/release',
    'assets/js/libs': settings.root + '/client/dist/release',
    'assets/font': settings.root + '/client/assets/font',
    'assets/img': settings.root + '/client/assets/img',
    'assets/css': settings.root + '/client/dist/release',
    'js': settings.root + '/client/assets/js'
  };

  if (fs.existsSync(__dirname + '/loggerConfiguration.ini')) {
    var logSettings = iniparser.parseSync(__dirname + '/loggerConfiguration.ini');
    settings.logging = _.defaults(logSettings, settings.logging);
  }

}

/* helpers */
function getLanguages() {
  var lngs = fs.readdirSync(__dirname + '/locales');
  return _.reject(lngs, function(lng) {
    return lng.indexOf('.') === 0;
  });
}
function isRelative(p) {
    var normal = path.normalize(p);
    var absolute = path.resolve(p);
    return normal != absolute;
}

// read from file created from setup
if (fs.existsSync(__dirname + '/settings.ini')) {
  var properties = iniparser.parseSync(__dirname + '/settings.ini');

  if (properties.setupVersion) {
    settings.setupVersion = 'v' + properties.setupVersion;
  }

  if (properties.sdkService !== null && properties.sdkService !== undefined) {
    if (properties.sdkService) {
      settings.sdkService = true;
    } else {
      settings.sdkService = false;
    }
  }

  if (properties.servicePort) {
    settings.servicePort = properties.servicePort;
  }

  if (properties.sdkPort) {
    settings.sdkPort = properties.sdkPort;
  }

  settings.devicestacksPath = __dirname + '/../devicestacks';
  if (properties.devicestacksPath) {
    if (isRelative(properties.devicestacksPath)) {
      settings.devicestacksPath = __dirname + '/' + properties.devicestacksPath;
    }
  }
}

module.exports = settings;
