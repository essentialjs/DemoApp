var pkg = require('../package.json');
var fs = require('fs');

var DISCOURSE_FILE = __dirname + '/DISCOURSE_POST_URL';

module.exports = {
  dist: 'dist',
  releasePostUrl: fs.readFileSync(DISCOURSE_FILE).toString(),
  releasePostFile: DISCOURSE_FILE,

  protractorPort: 8876,

  banner:
    '/*!\n' +
    ' * Copyright 2014 Right Here Inc.\n' +
    ' * http://learnrighthere.com/\n' +
    ' *\n' +
    ' * HTML5 DemoApp, v<%= pkg.version %>\n' +
    ' * A demonstration of a Live Interactive HTML5 mobile centric website.\n' +
    ' * http://ionicframework.com/\n' +
    ' *\n' +
    ' * By @thepian <3\n' +
    ' *\n' +
    ' * Licensed under the MIT license. Please see LICENSE for more information.\n'+
    ' *\n' +
    ' */\n\n',
  closureStart: '(function() {\n',
  closureEnd: '\n})();',

  ionicFiles: [
    // Base
    'js/ionic.js',

    // Utils
    'js/utils/dom.js',
    'js/utils/events.js',
    'js/utils/gestures.js',
    'js/utils/platform.js',
    'js/utils/poly.js',
    'js/utils/tap.js',
    'js/utils/activator.js',
    'js/utils/utils.js',
    'js/utils/list.js',
    'js/utils/keyboard.js',
    'js/utils/viewport.js',

    // Views
    'js/views/view.js',
    'js/views/scrollView.js',
    'js/views/headerBarView.js',
    'js/views/listView.js',
    'js/views/modalView.js',
    'js/views/sideMenuView.js',
    'js/views/toggleView.js'
  ],

  angularIonicFiles: [
    'js/angular/*.js',
    'js/angular/service/**/*.js',
    'js/angular/controller/**/*.js',
    'js/angular/directive/**/*.js'
  ],


  //Exclamation can be no longer than 14 chars
  exclamations: [
    "Aah","Ah","Aha","All right","Aw","Ay","Aye","Bah","Boy","By golly","Boom","Cheerio","Cheers","Come on","Crikey","Dear me","Egads","Fiddle-dee-dee","Gadzooks","Gangway","G'day","Gee whiz","Gesundheit","Get outta here","Gosh","Gracious","Great","Gulp","Ha","Ha-ha","Hah","Harrumph","Hey","Hooray","Hurray","Huzzah","I say","Look","Look here","Long time","Lordy","Most certainly","My my","My word","Oh","Oh-oh","Oh no","Okay","Okey-dokey","Ooh","Oye","Phew","Quite","Ready","Right on","Roger that","Rumble","Say","See ya","Snap","Sup","Ta-da","Take that","Tally ho","Thanks","Toodles","Touche","Tut-tut","Very nice","Very well","Voila","Vroom","Well done","Well, well","Whoa","Whoopee","Whew","Word up","Wow","Wuzzup","Ya","Yea","Yeah","Yippee","Yo","Yoo-hoo","You bet","You don't say","You know","Yow","Yum","Yummy","Zap","Zounds","Zowie"
  ],

  //Message can be no longer than it is. Currently it's 126 chars with the short git urls,
  //and can have up to a 14 char long exclamation prepended.
  releaseMessage: function() {
    return this.exclamations[Math.floor(Math.random()*this.exclamations.length)] + '! ' +
      'Just released @MobileCentric24 v' + pkg.version + ' "' + pkg.codename + '"! ' +
      this.releasePostUrl;
  },

};
