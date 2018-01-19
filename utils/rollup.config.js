import multiEntry from "rollup-plugin-multi-entry";

export default {
    input: './dist/out-tsc/utils/*.js',
    output: {
        file: './dist/tmp/wm-utils.umd.js',
        format: 'umd'
    },
    name: 'wm.utils',
    globals: {
        '@angular/core': 'ng.core',
        '@angular/common': 'ng.common',
        '@angular/compiler': 'ng.compiler',
        '@angular/platform-browser-dynamic': 'ng.platformBrowserDynamic',
        '@angular/platform-browser': 'ng.platformBrowser',
        '@angular/forms': 'ng.forms',
        '@angular/router': 'ng.router',
        "lodash": "_"
    },
    plugins: [
        multiEntry()
    ]
};