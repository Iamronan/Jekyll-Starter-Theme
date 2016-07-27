// Require all the things
const gulp = require('gulp'),
      sass = require('gulp-sass'),
      gutil = require('gulp-util'),
      plumber = require('gulp-plumber'),
      rename = require('gulp-rename'),

      //css
      minifyCSS = require('gulp-minify-css'),
      prefixer = require('gulp-autoprefixer'),
      sourcemaps = require('gulp-sourcemaps'),

      //css
      browserSync = require('browser-sync'),

      // Minify html & images
      imagemin = require('gulp-imagemin'),
      htmlmin = require('gulp-htmlmin'),


      //js
      uglify = require('gulp-uglify'),
      concat = require('gulp-concat'),

      //errors
      pump = require('pump'),
      notify = require("gulp-notify"),

      // help run jekyllbuild
      cp = require('child_process'),
      connect = require('gulp-connect');


const jekyll   = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';
const messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};


// Set the path variables
const base_path = './',
      src = base_path + '_dev/src',
      dist = base_path + 'assets',
      paths = {
          js: src + '/js/*.js',
          scss: [ src +'/sass/*.scss',
                  src +'/sass/**/*.scss',
                  src +'/sass/**/**/*.scss'],
          jekyll: ['index.html',  '*.md', '_posts/*', '_layouts/*', '_includes/*' , 'assets/*', 'assets/**/*']
      };


/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
    browserSync.reload();
});

/**
 * Wait for jekyll-build, then launch the Server
 */
gulp.task('browser-sync', ['compile-sass', 'jekyll-build'], function() {
    browserSync({
        server: {
            baseDir: '_site'
        }
    });
});

// Compile sass to css
gulp.task('compile-sass', () => {
  return gulp.src([

        '_dev/src/sass/*',
        '_dev/src/sass/blaze/scss/blaze.scss'
    ])

    .pipe(plumber((error) => {
        gutil.log(gutil.colors.red(error.message));
        gulp.task('compile-sass').emit('end');
    }))
    .pipe(sourcemaps.init()) // Start Sourcemaps
    .pipe(sass())
    .pipe(prefixer('last 3 versions', 'ie 9'))
    .pipe(minifyCSS())
    .pipe(rename({dirname: dist + '/css'}))
    .pipe(sourcemaps.write('.')) // Creates sourcemaps for minified styles
    .pipe(gulp.dest('./'))
    .pipe(notify("sass compile complete!"))

});


// Concat site & vendor specific js files and minify
gulp.task('site-js', function () {

        gulp.src([

            '_dev/src/js/**/*.js',
            '_dev/src/js/vendor/jquery/dist/jquery.js'
        ])

        .pipe(plumber())
        .pipe(concat('site-min.js'))
        .pipe(uglify())
        .pipe(rename({dirname: dist + '/js'}))
        .pipe(gulp.dest('./'))
        .pipe(notify("js concat complete!"))

});

//Minify Images
    gulp.task('minify-images', () =>
    gulp.src('_dev/src/images/*')
    .pipe(imagemin())
    .pipe(rename({dirname: dist + '/images'}))
    .pipe(gulp.dest('./'))
    .pipe(notify("Images minified!"))
);



/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', function (done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn( jekyll , ['build'], {stdio: 'inherit'})
        .on('close', done);
});



// Watch files
gulp.task('watch', () => {

  gulp.watch(paths.jekyll, ['jekyll-rebuild', 'jekyll-build']);
  gulp.watch(paths.scss, ['compile-sass']);
  gulp.watch(paths.js, ['site-js']);

});

// Start Everything with the default task
gulp.task('default', [ 'compile-sass', 'jekyll-build', 'browser-sync', 'site-js', 'watch', 'minify-images' ]);
