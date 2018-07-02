export default {
    input: './dist/tmp/angular2-websocket.js',
    output: {
        file: './dist/tmp/angular-websocket.umd.js',
        format: 'umd',
        name: 'angularWebSocket',
        globals: {
            '@angular/core': 'ng.core',
            'rxjs/Observable': 'Rx',
            'rxjs/BehaviorSubject': 'Rx',
            'rxjs/Subject': 'Rx',
            'tslib': 'tslib'
        }
    }
};
