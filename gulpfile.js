var gulp = require('gulp'),
    server = require('gulp-express'),
    browserify = require('gulp-browserify');

gulp.task('server', function(){
  server.run(['index.js']);
  gulp.watch(['index.js','views/*.ect'], [server.run]);
});

gulp.task('scripts', function(){
  gulp.src('components/main.js')
    .pipe(browserify({
      transform: ['vueify'],
      extensions: ['.vue']
    }))
    .pipe(gulp.dest('public/js'));
});

gulp.task('watch', function(){
  gulp.watch(['components/*.vue', 'components/*.js'], ['scripts']);
});

gulp.task('default', ['watch', 'scripts', 'server']);
