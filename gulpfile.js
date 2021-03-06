/*----- IMPORTS --------------------------------------------------------------*/
const { dest, series, src, watch } = require('gulp'),
  check = require('gulp-check-filesize'),
  concat = require('gulp-concat'),
  htmlmin = require('gulp-htmlmin'),
  minify = require('gulp-clean-css'),
  replace = require('gulp-html-replace'),
  uglify = require('gulp-uglify'),
  web = require('gulp-webserver'),
  zip = require('gulp-zip'),
  /*----- CONSTANTS ----------------------------------------------------------*/
  buildPath = '_build',
  css = 'game.min.css',
  host = 'localhost',
  js = 'game.min.js',
  port = '5000',
  source = {
    css: ['src/css/*.css'],
    js: ['src/js/game.js', 'src/js/*.js'],
    html: ['src/index.html'],
  };

/*----- TASKS ----------------------------------------------------------------*/
const build = {
    css: _ =>
      src(source.css).pipe(concat(css)).pipe(minify()).pipe(dest(buildPath)),
    html: _ =>
      src(source.html)
        .pipe(replace({ css, js }))
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(dest(buildPath)),
    js: _ =>
      src(source.js).pipe(concat(js)).pipe(uglify()).pipe(dest(buildPath)),
    zip: _ =>
      src('./_build/*')
        .pipe(zip('game.zip'))
        .pipe(dest('./_dist'))
        .pipe(check({ fileSizeLimit: 16384 })),
  },
  buildAll = series(build.js, build.css, build.html, build.zip),
  serve = _ =>
    src('./src').pipe(
      web({
        host,
        port,
        fallback: 'index.html',
        livereload: false,
        directoryListing: false,
        open: true,
      })
    ),
  watchSrc = _ => {
    watch(source.css, series(build.css, build.zip));
    watch(source.js, series(build.js, build.zip));
    watch(source.html, series(build.html, build.zip));
  };

/*----- EXPORTS --------------------------------------------------------------*/
module.exports = {
  serve,
  build: buildAll,
  watch: watchSrc,
  default: series(buildAll, serve, watchSrc),
};
