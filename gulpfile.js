var gulp = require('gulp'),
  jade = require('gulp-jade'),
	uglify = require('gulp-uglify'),
	// imagemin = require('gulp-imagemin'),
	// sourcemaps = require('gulp-sourcemaps'),
  sass = require('gulp-sass');

var paths = {
  site: ['site/**/*.jade'],
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

gulp.task('watch',function() {
  gulp.watch(paths.site, ['site']);
  // gulp.watch(paths.scripts, ['scripts']);
});
gulp.task('default', ['watch','site']);

/*
var 

gulp.task('sass', function () {
    gulp.src('./scss/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('./css'));
});

var sourcemaps = require('gulp-sourcemaps');

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



var    Amdclean  = require('gulp-amdclean');

gulp.tasks('build', ['lint', 'test'], function() {
  return gulp
    .src(['src/main.js'])
    .pipe(Amdclean.gulp({
      'prefixMode': 'standard'
      // some other options
    })
    .pipe(gulp.dest('./bin'));
});

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