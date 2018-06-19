
export default {
    input: './dist/tmp/ngx-toastr.js',
    output: {
        file: './dist/tmp/ngx-toastr.umd.js',
        format: 'umd',
        name: 'ngxToastr',
        globals: {
            '@angular/core': 'ng.core',
            '@angular/animations': 'ng.animations',
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

            'rxjs/scheduler/queue': 'Rx.Scheduler.prototype',

            'rxjs': 'Rx',
            'rxjs/Observable': 'Rx',
            'rxjs/BehaviorSubject': 'Rx',
            'rxjs/Subject': 'Rx',
            'tslib': 'tslib'
        }
    }

};
