export default {
    input: './dist/tmp/ngx-bootstrap.es2015.js',
    output: {
        file: './dist/tmp/ngx-bootstrap.umd.js',
        format: 'umd'
    },
    name: 'ngxBootstrap',
    globals: {
        '@angular/core': 'ng.core',
        '@angular/animations': 'ng.animations',
        '@angular/common': 'ng.common',
        '@angular/common/http': 'ng.common.http',
        '@angular/platform-browser-dynamic': 'ng.platformBrowserDynamic',
        '@angular/platform-browser': 'ng.platformBrowser',
        '@angular/forms': 'ng.forms',
        '@angular/router': 'ng.router',
        'rxjs/observable/of': 'Rx.Observable',
        'rxjs/operator/concatMap': 'Rx.Observable.prototype',
        'rxjs/operator/filter': 'Rx.Observable.prototype',
        'rxjs/operator/map': 'Rx.Observable.prototype',
        'rxjs/operator/scan': 'Rx.Observable.prototype',
        'rxjs/operator/observeOn': 'Rx.Observable.prototype',
        'rxjs/operator/distinctUntilChanged': 'Rx.Observable.prototype',

        'rxjs/add/operator/filter': 'Rx.Observable.prototype',
        'rxjs/add/operator/map': 'Rx.Observable.prototype',
        'rxjs/add/observable/timer': 'Rx.Observable.prototype',
        'rxjs/add/observable/from': 'Rx.Observable.prototype',
        'rxjs/add/observable/debounceTime': 'Rx.Observable.prototype',
        'rxjs/add/observable/mergeMap': 'Rx.Observable.prototype',
        'rxjs/add/observable/toArray': 'Rx.Observable.prototype',

        'rxjs/scheduler/queue': 'Rx.Scheduler',

        'rxjs/Observable': 'Rx',
        'rxjs/BehaviorSubject': 'Rx',
        'rxjs/Subject': 'Rx',
        'tslib': 'tslib'
    }
};
