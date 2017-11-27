var gulp = require('gulp');
var replace = require('gulp-string-replace');

gulp.task('default', function () {
    console.log('What?', process.argv, process.argv[2]);
    gulp.src(["./module/tests.spec.ts"])
        .pipe(replace(/\[\[ENDPOINT\]\]/g, process.argv[3] + '/'))
        .pipe(gulp.dest('./module/'))
});