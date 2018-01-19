
export default {
    input: './node_modules/@angular/common/esm5/http.js',
    output: {
        file: './dist/tmp/common-http.umd.js',
        format: 'umd'
    },
    name: 'ng.common.http',
    globals: {
        '@angular/core': 'ng.core',
        '@angular/common': 'ng.common',
        '@angular/common/http': 'ng.common.http',
        '@angular/platform-browser-dynamic': 'ng.platformBrowserDynamic',
        '@angular/platform-browser': 'ng.platformBrowser',
        '@angular/forms': 'ng.forms',
        '@angular/router': 'ng.router',
        '@utils/dom': 'wm.utils',
        '@utils/utils': 'wm.utils',
        '@utils/styler': 'wm.utils',
        '@utils/watcher': 'wm.utils',
        '@utils/expression-parser': 'wm.utils',
        '@components/components.module': 'wm.components',
        'rxjs/observable/of': 'Rx.Observable',
        'rxjs/operator/concatMap': 'Rx.Observable.prototype',
        'rxjs/operator/filter': 'Rx.Observable.prototype',
        'rxjs/operator/map': 'Rx.Observable.prototype',
        'rxjs/Observable': 'Rx',
        'tslib': 'tslib'
    }
};
