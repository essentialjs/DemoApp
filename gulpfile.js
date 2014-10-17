var gulp = require('gulp'),
  GithubApi = require('github'),
  path = require('canonical-path'),
  q = require('q'),
  request = require('request'),
  semver = require('semver'),
  through = require('through'),
  _ = require('lodash'),
  jade = require('gulp-jade'),
  jshint = require('gulp-jshint'),
  uglify = require('gulp-uglify'),
  sourcemaps = require('gulp-sourcemaps'),
  rigger = require('gulp-rigger'),
  cached = require('gulp-cached'),
  remember = require('gulp-remember'),
  concat = require('gulp-concat'),
  footer = require('gulp-footer'),
  minifyCss = require('gulp-minify-css'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  template = require('gulp-template'),
  gutil = require('gulp-util'),
  Amdclean  = require('gulp-amdclean'),
	// imagemin = require('gulp-imagemin'),
	// sourcemaps = require('gulp-sourcemaps'),
  sass = require('gulp-sass');

var argv = require('minimist')(process.argv.slice(2));

var buildConfig = require('./config/build.config.js'),
    changelog = require('conventional-changelog'),
    es = require('event-stream'),
    irc = require('ircb'),
    marked = require('marked'),
    mkdirp = require('mkdirp'),
    twitter = require('node-twitter-api'),
    cp = require('child_process'),
    fs = require('fs');

// package data
var pkg = require('./package.json');
var banner = _.template(buildConfig.banner, { pkg: pkg });

var IS_RELEASE_BUILD = !!argv.release;
if (IS_RELEASE_BUILD) {
  gutil.log(
    gutil.colors.red('--release:'),
    'Building release version (minified, debugs stripped)...'
  );
}

/**
 * Load Test Tasks
 */
//require('./config/gulp-tasks/test')(gulp, argv);

/**
 * Load Docs Tasks
 */
//require('./config/gulp-tasks/docs')(gulp, argv);

if (argv.dist) {
  buildConfig.dist = argv.dist;
}

gulp.task('default', ['build']);
gulp.task('build', ['site','rigger', 'sass']);
gulp.task('validate', ['jshint', 'ddescribe-iit', 'karma']);

var IS_WATCH = false;
gulp.task('watch', ['build'], function() {
  IS_WATCH = true;
  gulp.watch('js/**/*.js', ['bundle']);
  gulp.watch('scss/**/*.scss', ['sass']);
});

/**
 * internal
 */

var paths = {
  site: ['site/**/*.jade'],
  rigger: ['client/**/*.js'],
};

// Compile to HTML
gulp.task('site', function() {
  var YOUR_LOCALS = {};

  gulp.src('./site/*.jade')
    .pipe(jade({
      basedir: path.join(__dirname,'lib'),
      locals: YOUR_LOCALS
    }))
    .pipe(gulp.dest('./site/'))
});

gulp.task('rigger', function () {

  gulp.src( pkg["libs-js"])
    .pipe(cached())
    //.pipe(concat('libs.js'))
    .pipe(sourcemaps.init({ loadingMaps: true }))
    .pipe(uglify())  // { outSourceMap: true }
    .pipe(remember())
    .pipe(concat({ path:'libs.min.js' }))  //TODO header
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest('./site/assets/js/'));

  gulp.src( pkg["libs-js"])
    .pipe(concat({ path:'libs.js' }))
    .pipe(gulp.dest('./site/assets/js/'));

  gulp.src('./client/code/rigged/*.js')
    .pipe(rigger())
    .pipe(gulp.dest('./site/assets/js/'));
});

gulp.task('sass', function () {
    gulp.src('./client/css/site/**/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('./site/assets/css'));
});

gulp.task('lint', function() {
  return gulp.src('./lib/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('YOUR_REPORTER_HERE'));
});

gulp.task('jshint', function() {
  return gulp.src(['./lib/**/*.js'])
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter(require('jshint-summary')({
      fileColCol: ',bold',
      positionCol: ',bold',
      codeCol: 'green,bold',
      reasonCol: 'cyan'
    })))
    .pipe(jshint.reporter('fail'));
});

/* Done by CI
gulp.task('dist', function() {
    submodule dist
});
*/

gulp.task('watch',function() {
  gulp.watch(paths.site, ['site']);
  gulp.watch(paths.rigger, ['rigger']);
  // gulp.watch(paths.scripts, ['scripts']);
});
gulp.task('watch-all', ['watch','site','rigger']);

// gulp.task('build', ['lint', 'test'], function() {
//   return gulp.src(['src/main.js']).pipe(Amdclean.gulp({
//       'prefixMode': 'standard'
//       // some other options
//     }).pipe(gulp.dest('./bin'));
// });


/*
var


var ;

gulp.src('./scss/*.scss')
  .pipe(sourcemaps.init())
    .pipe(sass())
  .pipe(sourcemaps.write('./maps'))
  .pipe('./css');

// will write the source maps to ./dest/css/maps

var

//Compile to JS

var jade = require('gulp-jade');

gulp.task('templates', function() {
  gulp.src('./lib/*.jade')
    .pipe(jade({
      client: true
    }))
    .pipe(gulp.dest('./dist/'))
});


var mocha = require('gulp-mocha');

gulp.task('default', function () {
    return gulp.src('test.js', {read: false})
        .pipe(mocha({reporter: 'nyan'}));
});

*/
