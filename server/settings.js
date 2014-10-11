var fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    iniparser = require('iniparser'),
    root = path.join(__dirname,'..');

var settings = {
  title: 'demoapp',
  version: require('../package.json').version,
  setupVersion: 'directly from source',

  // where is stuff
  "public": root + '/site',
  assets: root + '/site/assets',

  // DEV only paths
  scss: root + '/site/scss',

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
  lngs: getLanguages(),
  debug: (process.env.NODE_ENV !== 'production' || process.env.DEBUG) ? true : false
};

settings.uri = 'http://' + settings.host + ':' + settings.servicePort;
settings.sessionSecret = settings.title;
settings.sessionKey = settings.title + '.sid';
settings.root = root;

settings.statics = {
  'app': settings.root + '/client/app',
  'app/templates': settings.root + '/client/assets/templates',
  'assets': settings.root + '/client/assets',
  'js': settings.root + '/client/assets/js'
};

settings.sockjs_opts = {
  sockjs_url: "http://cdn.sockjs.org/sockjs-0.3.min.js"
};

if (process.env.NODE_ENV == 'production') {

  settings.logging.level = 'error';

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
  var lngs = fs.readdirSync(root + '/locales');
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
if (fs.existsSync(root + '/settings.ini')) {
  var properties = iniparser.parseSync(root + '/settings.ini');

  if (properties.setupVersion) {
    settings.setupVersion = 'v' + properties.setupVersion;
  }
}

module.exports = settings;
