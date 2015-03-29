'use strict';

var gulp = require('gulp');
var less = require('gulp-less');
var path = require('path');

gulp.task('copyDemo', function() {
    return gulp.src('./dist/**')
        .pipe(gulp.dest('./demo/libs'));
});

gulp.task('copyDist', function() {
    return gulp.src('./src/d-splitter.js')
        .pipe(gulp.dest('./dist/'));
});

gulp.task('demo', ['copyDemo'], function() {
    var webserver = require('gulp-webserver');
    return gulp.src('./demo/')
        .pipe(webserver({
            host: '0.0.0.0',
            port: 8080,
            livereload: false,
            directoryListing: false,
            open: false
        }));
});


gulp.task('dist', ['copyDist', 'less'], function() {
    var uglify = require('gulp-uglify');
    var sourcemaps = require('gulp-sourcemaps');
    var rename = require('gulp-rename');

    return gulp.src('./dist/d-splitter.js')
        .pipe(sourcemaps.init())
        .pipe(rename({
            basename: 'd-splitter.min'
        }))
        .pipe(uglify())
        .pipe(sourcemaps.write('./', {
            sourceRoot: '.'
        }))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('less', function () {
  return gulp.src('./src/*.less')
    .pipe(less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(gulp.dest('./dist/css'));
});