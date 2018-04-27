const embedTemplates = require('gulp-angular-embed-templates');
//const inlineNg2Styles = require('gulp-inline-ng2-styles');
const gulp = require('gulp');
var runSequence = require('run-sequence');

var src = './components/src/widgets';
var dest = './dist/out-tsc/components/src/widgets';

gulp.task('copy-html-files', () => {
    return gulp.src([`${src}/**/*.html`]).pipe(gulp.dest(dest));
});

gulp.task('inline-html-files', () => {
    gulp.src(`${dest}/**/*.js`)
        .pipe(embedTemplates())
        .pipe(gulp.dest(`${dest}`));

});

gulp.task('switch-to-mobile', () => {
    src = './mobile/components/src/widgets';
    dest = './dist/out-tsc/mobile/components/src/widgets';
});

gulp.task('default', () => {
    runSequence('copy-html-files',
        'inline-html-files',
        'switch-to-mobile',
        'copy-html-files',
        'inline-html-files');
});

gulp.start('default');