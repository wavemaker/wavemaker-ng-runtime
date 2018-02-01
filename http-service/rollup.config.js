export default {
    input: './dist/out-tsc/http-service/http-service.module.js',
    output: {
        file: './dist/tmp/http-service.umd.js',
        format: 'umd'
    },
    name: 'http-service',
    globals: {
        '@angular/core': 'ng.core',
        '@angular/common': 'ng.common',
        '@angular/compiler': 'ng.compiler',
        '@angular/platform-browser-dynamic': 'ng.platformBrowserDynamic',
        '@angular/platform-browser': 'ng.platformBrowser',
        '@angular/forms': 'ng.forms',
        '@angular/router': 'ng.router',
        '@angular/common/http': 'ng.common.http'
    }
};