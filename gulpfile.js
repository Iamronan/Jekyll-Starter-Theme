// Require all the things
const gulp = require('gulp'),
      sass = require('gulp-sass'),
      gutil = require('gulp-util'),
      plumber = require('gulp-plumber'),
      rename = require('gulp-rename'),
      minifyCSS = require('gulp-minify-css'),
      prefixer = require('gulp-autoprefixer'),
      connect = require('gulp-connect');
      cp = require('child_process');
      livereload = require('gulp-livereload');
      browserSync = require('browser-sync');
      imagemin = require('gulp-imagemin');
      htmlmin = require('gulp-htmlmin');

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
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', ['minify-images'], function (done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn( jekyll , ['build'], {stdio: 'inherit'})
        .on('close', done);
});

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
  return gulp.src(paths.scss)
    .pipe(plumber((error) => {
        gutil.log(gutil.colors.red(error.message));
        gulp.task('compile-sass').emit('end');
    }))
    .pipe(sass())
    .pipe(prefixer('last 3 versions', 'ie 9'))
    .pipe(minifyCSS())
    .pipe(rename({dirname: dist + '/css'}))
    .pipe(gulp.dest('./'))
    .pipe(livereload());
});

// Minify Images
gulp.task('minify-images', () =>
    gulp.src('src/images/*')
        .pipe(imagemin())
        .pipe(gulp.dest('./'))
);


// Watch files
gulp.task('watch', () => {  

  gulp.watch(paths.jekyll, ['jekyll-rebuild', 'jekyll-build']);
  gulp.watch(paths.scss, ['compile-sass']);

});

// Start Everything with the default task
gulp.task('default', [ 'compile-sass', 'jekyll-build', 'browser-sync', 'watch' ]);
