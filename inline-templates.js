const embedTemplates = require('gulp-angular-embed-templates');
//const inlineNg2Styles = require('gulp-inline-ng2-styles');
const gulp = require('gulp');

const src = './components/widgets';
const dest = './dist/out-tsc/components/widgets';

gulp.src([`${src}/**/*.html`])
    .pipe(gulp.dest('./dist/out-tsc/components/widgets'));


gulp.src(`${dest}/**/*.js`) // also can use *.js files
    .pipe(embedTemplates())
    .pipe(gulp.dest(`${dest}`));