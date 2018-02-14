const embedTemplates = require('gulp-angular-embed-templates');
//const inlineNg2Styles = require('gulp-inline-ng2-styles');
const gulp = require('gulp');

const src = './components/widgets';
const dest = './dist/out-tsc/components/widgets';

gulp.task('copy-html-files', () => {
    return gulp.src([`${src}/**/*.html`]).pipe(gulp.dest(dest));
});

gulp.task('inline-html-files', () => {
    gulp.src(`${dest}/**/*.js`)
        .pipe(embedTemplates())
        .pipe(gulp.dest(`${dest}`));

});

gulp.task('default', ['copy-html-files'], () => {
    gulp.start('inline-html-files');
});

gulp.start('default');