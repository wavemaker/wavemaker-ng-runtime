const gulp = require("gulp");
const filter = require("gulp-filter");
const purify = require("gulp-purify-css");
const gzip = require("gulp-gzip");
const brotli = require("gulp-brotli");
const rename = require("gulp-rename");
const clean = require("gulp-clean");
const { series, parallel } = require("gulp");

// #1 | Optimize CSS
gulp.task("css", () => {
    return gulp
        .src("../dist/ng-bundle/*")
        .pipe(
            filter([
                "**/styles.*.css",
                "**/wm-styles.css",
                "!**/wm-styles.*.css",
                "!**/*.br.*",
                "!**/*.gzip.*"
            ])
        )
        .pipe(
            purify(["../dist/ng-bundle/*.js"], {
                info: true,
                minify: true,
                rejected: true,
                whitelist: []
            })
        )
        .pipe(gulp.dest("../dist/test/"));
});
// # 2 | Genereate GZIP files
gulp.task("css-gzip", () => {
    return gulp
        .src("../dist/test/*")
        .pipe(filter(["**/*.css", "!**/*.br.*", "!**/*.gzip.*"]))
        .pipe(gzip({ append: false }))
        .pipe(
            rename(path => {
                path.extname = ".gzip" + path.extname;
            })
        )
        .pipe(gulp.dest("../dist/test/"));
});
// # 3 | Genereate BROTLI files
gulp.task("css-br", () => {
    return gulp
        .src("../dist/test/*")
        .pipe(filter(["**/*.css", "!**/*.br.*", "!**/*.gzip.*"]))
        .pipe(brotli.compress())
        .pipe(
            rename(path => {
                path.extname =
                    ".br" +
                    path.basename.substring(
                        path.basename.lastIndexOf("."),
                        path.basename.length
                    );
                path.basename = path.basename.substring(
                    0,
                    path.basename.lastIndexOf(".")
                );
            })
        )
        .pipe(gulp.dest("../dist/test"));
});
// # 4 | Clear ng-build CSS
gulp.task("clear-ng-css", () => {
    return gulp
        .src("../dist/ng-bundle/*")
        .pipe(filter(["**/styles*.css", "**/wm-styles*.css"]))
        .pipe(clean({ force: true }));
});
// # 5 | Copy optimized CSS
gulp.task("copy-op-css", () => {
    return gulp.src("../dist/test/*").pipe(gulp.dest("../dist/ng-bundle/"));
});
// #6 | Clear temp folder
gulp.task("clear-test", () => {
    return gulp
        .src("../dist/test/", { read: false })
        .pipe(clean({ force: true }));
});

/*
 ### Order of Tasks ###
 * Add hash to the wm-styles.css
 * Optimize the styles generated from ng build
 * Create compressed files for optimized css
 * Clear the angular build output css
 * Copy the optimized css to ng-bundle folder
 * Clear the temp folder
 */
exports.default = series(
    "css",
    parallel("css-gzip", "css-br"),
    "clear-ng-css",
    "copy-op-css",
    "clear-test"
);
