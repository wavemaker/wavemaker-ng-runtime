export default {
    input: './dist/out-tsc/variables/variables.module.js',
    output: {
        file: './dist/tmp/wm-variables.umd.js',
        format: 'umd'
    },
    name: 'wm.variables',
    globals: {
        '@angular/core': 'ng.core',
        '@angular/common': 'ng.common',
        '@angular/compiler': 'ng.compiler',
        '@angular/platform-browser-dynamic': 'ng.platformBrowserDynamic',
        '@angular/platform-browser': 'ng.platformBrowser',
        '@angular/forms': 'ng.forms',
        '@angular/router': 'ng.router',
        '@angular/common/http': 'ng.common.http',
        '@utils/watcher': 'wm.utils',
        '@utils/expression-parser': 'wm.utils',
        '@utils/utils': 'wm.utils'
    }
};