export default [
    {
        input: './projects/mobile/awesome-cordova/awesome-cordova-core.js',
        output: {
            file : './dist/tmp/libs/awesome-cordova/awesome-cordova-core.umd.js',
            format : 'umd',
            name: 'awesomeCordova.core',
            globals: {
                'rxjs/observable/fromEvent': 'rxjs',
                'rxjs/Observable': 'rxjs',
                'rxjs/observable/throw' : 'rxjs',
                'rxjs/observable/merge': 'rxjs'
            }
        }
    },
    {
        input: './projects/mobile/awesome-cordova/awesome-cordova-plugins.js',
        output: {
            file : './dist/tmp/libs/awesome-cordova/awesome-cordova-plugins.umd.js',
            format : 'umd',
            name: 'awesomeCordova.plugins',
            globals: {
                '@angular/core': 'ng.core',
                '@awesome-cordova/core': 'awesomeCordova.core',
                'rxjs/observable/fromEvent': 'rxjs',
                'rxjs/Observable': 'rxjs',
                'rxjs/observable/throw' : 'rxjs',
                'rxjs/observable/merge': 'rxjs'
            }
        }
    }
];
