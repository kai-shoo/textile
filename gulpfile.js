const gulp = require('gulp');
const plumber = require('gulp-plumber');
const sourcemap = require('gulp-sourcemaps');
const less = require('gulp-less');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const sync = require('browser-sync').create();

const svgstore = require('gulp-svgstore');
const rename = require('gulp-rename');
const del = require('del');
const csso = require('postcss-csso');
const htmlmin = require('gulp-htmlmin');
const uglify = require('gulp-uglify-es').default;
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');

// Styles

const styles = () => {
  return gulp
    .src('source/less/style.less')
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(less())
    .pipe(gulp.dest('build/css'))
    .pipe(postcss([autoprefixer(), csso()]))
    .pipe(rename('style.css'))
    .pipe(sourcemap.write('.'))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css'))
    .pipe(sync.stream());
};

exports.styles = styles;

// Html

const html = () => {
  return gulp.src('source/*.html').pipe(gulp.dest('build'));
};

exports.html = html;

// Scripts

const scripts = () => {
  return gulp
    .src('source/js/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('build/js'))
    .pipe(sync.stream());
};

exports.scripts = scripts;

// Images

const images = () => {
  return gulp
    .src('source/img/**/*.{jpg,png,svg}')
    .pipe(
      imagemin([
        imagemin.mozjpeg({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 3 }),
        imagemin.svgo(),
      ]),
    )
    .pipe(gulp.dest('build/img'));
};

exports.images = images;

// WebP

const createWebp = () => {
  return gulp
    .src('source/img/**/*.{jpg,png}')
    .pipe(webp({ quality: 90 }))
    .pipe(gulp.dest('build/img'));
};

exports.createWebp = createWebp;

// Sprites

const sprites = () => {
  return gulp
    .src('source/img/icons/*.svg')
    .pipe(svgstore())
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img'));
};

exports.sprites = sprites;

// Copy

const copy = (done) => {
  gulp
    .src(
      [
        'source/fonts/*.{woff2,woff}',
        'source/*.ico',
        'source/img/**/*.{jpg,png,svg}',
      ],
      {
        base: 'source',
      },
    )
    .pipe(gulp.dest('build'));
  done();
};

exports.copy = copy;

// Clear

const clear = () => {
  return del('build');
};

exports.clear = clear;

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'build',
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
};

exports.server = server;

// Reload

const reload = (done) => {
  sync.reload();
  done();
};

exports.reload = reload;

// Watcher

const watcher = () => {
  gulp.watch('source/less/**/*.less', gulp.series(styles));
  gulp.watch('source/js/*.js', gulp.series(scripts));
  gulp.watch('source/*.html', gulp.series(html, reload));
};

const build = gulp.series(
  clear,
  gulp.parallel(styles, html, scripts, sprites, copy, images, createWebp),
);

exports.build = build;

// Default

exports.default = gulp.series(
  clear,
  gulp.parallel(styles, html, scripts, sprites, copy, createWebp),
  gulp.series(server, watcher),
);
