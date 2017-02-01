'use strict';

const Del = require('del');
const Gulp = require('gulp');
const Babel = require('gulp-babel');
const ESlint = require('gulp-eslint');
const Export = require('gulp-export');


const destDir = './build';
const srcDir = './src';

Gulp.task('clean', cb => {
  return Del([destDir, 'cache'], cb);
});

Gulp.task('js', ['clean'], () => {
  return Gulp.src([`${srcDir}/**/*.js`])
    .pipe(ESlint())
    .pipe(ESlint.format())
    .pipe(ESlint.failOnError())
    .pipe(Export())
    .pipe(Babel())
    .pipe(Gulp.dest(destDir));
});


Gulp.task();