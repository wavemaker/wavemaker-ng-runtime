export default [
    {
        input: './projects/mobile/ionic-native/ionic-native-core.js',
        output: {
            file : './dist/tmp/libs/ionic-native/ionic-native-core.umd.js',
            format : 'umd',
            name: 'ionicNative.core',
            globals: {
                'rxjs/observable/fromEvent': 'rxjs',
                'rxjs/Observable': 'rxjs',
                'rxjs/observable/throw' : 'rxjs',
                'rxjs/observable/merge': 'rxjs'
            }
        }
    },
    {
        input: './projects/mobile/ionic-native/ionic-native-plugins.js',
        output: {
            file : './dist/tmp/libs/ionic-native/ionic-native-plugins.umd.js',
            format : 'umd',
            name: 'ionicNative.plugins',
            globals: {
                '@angular/core': 'ng.core',
                '@ionic-native/core': 'ionicNative.core',
                'rxjs/observable/fromEvent': 'rxjs',
                'rxjs/Observable': 'rxjs',
                'rxjs/observable/throw' : 'rxjs',
                'rxjs/observable/merge': 'rxjs'
            }
        }
    }
];
