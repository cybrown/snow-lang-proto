'use strict';

var gulp = require('gulp');
var runSequence = require('run-sequence');
var jison = require('gulp-jison');
var mocha = require('gulp-mocha');
var rimraf = require('gulp-rimraf');
var ts = require('gulp-typescript');

gulp.task('clean', function() {
    return gulp.src(['./lib/', './typing/'], {read: false})
        .pipe(rimraf());
});

gulp.task('jison', function() {
    return gulp.src('./src/**/*.y')
        .pipe(jison())
        .pipe(gulp.dest('./lib/'));
});

gulp.task('mocha', function () {
    return gulp.src('lib/test/**/*.js', {read: false})
        .pipe(mocha());
});

gulp.task('typescript', function () {
    return gulp.src('src/**/*.ts').pipe(ts({
        noImplicitAny: true
    })).js.pipe(gulp.dest('lib/'));
});

gulp.task('test', function () {
    return runSequence('build', 'mocha');
});

gulp.task('build', function () {
	return runSequence('clean', 'jison', 'typescript');
});

gulp.task('default', ['build']);
