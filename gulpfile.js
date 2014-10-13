var gulp = require('gulp'),
  jade = require('gulp-jade'),
  uglify = require('gulp-uglify'),
  sourcemaps = require('gulp-sourcemaps'),
  rigger = require('gulp-rigger'),
  cached = require('gulp-cached'),
  remember = require('gulp-remember'),
  concat = require('gulp-concat'),
  Amdclean  = require('gulp-amdclean'),
	// imagemin = require('gulp-imagemin'),
	// sourcemaps = require('gulp-sourcemaps'),
  sass = require('gulp-sass');

// package data
var pkg = require('./package.json');

var paths = {
  site: ['site/**/*.jade'],
  rigger: ['client/**/*.js'],
};

// Compile to HTML
gulp.task('site', function() {
  var YOUR_LOCALS = {};

  gulp.src('./site/*.jade')
    .pipe(jade({
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
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./site/assets/js/'));

  gulp.src( pkg["libs-js"])
    .pipe(concat({ path:'libs.js' }))
    .pipe(gulp.dest('./site/assets/js/'));

  gulp.src('./client/code/rigged/*.js')
    .pipe(rigger())
    .pipe(gulp.dest('./site/assets/js/'));
});

gulp.task('watch',function() {
  gulp.watch(paths.site, ['site']);
  gulp.watch(paths.rigger, ['rigger']);
  // gulp.watch(paths.scripts, ['scripts']);
});
gulp.task('default', ['watch','site','rigger']);

// gulp.task('build', ['lint', 'test'], function() {
//   return gulp.src(['src/main.js']).pipe(Amdclean.gulp({
//       'prefixMode': 'standard'
//       // some other options
//     }).pipe(gulp.dest('./bin'));
// });


/*
var

gulp.task('sass', function () {
    gulp.src('./scss/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('./css'));
});

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



var    ;

var jshint = require('gulp-jshint');

gulp.task('lint', function() {
  return gulp.src('./lib/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('YOUR_REPORTER_HERE'));
});

var mocha = require('gulp-mocha');

gulp.task('default', function () {
    return gulp.src('test.js', {read: false})
        .pipe(mocha({reporter: 'nyan'}));
});

*/
