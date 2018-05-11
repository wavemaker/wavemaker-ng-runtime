export default [
    {
        input: './mobile/ionic-native/ionic-native-core.js',
        output: {
            file : './dist/tmp/ionic-native-core.umd.js',
            format : 'umd',
            name: 'ionicNative.core',
            globals: {
                'rxjs/add/observable/fromEvent': 'Rx.Observable.prototype',
                'rxjs/Observable': 'Rx',
                'rxjs/observable/throw' : 'Rx'
            }
        }
    },
    {
        input: './mobile/ionic-native/ionic-native-plugins.js',
        output: {
            file : './dist/tmp/ionic-native-plugins.umd.js',
            format : 'umd',
            name: 'ionicNative.plugins',
            globals: {
                '@angular/core': 'ng.core',
                '@ionic-native/core': 'ionicNative.core',
                'rxjs/add/observable/fromEvent': 'Rx.Observable.prototype',
                'rxjs/Observable': 'Rx',
                'rxjs/observable/throw' : 'Rx'
            }
        }
    }
];
