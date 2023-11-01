import {rollupExternals} from "../../../config/rollup-utils.mjs";

export default [
    {
        input: './projects/mobile/awesome-cordova/awesome-cordova-core.js',
        external: [ 'rxjs' ],
        output: {
            file : './dist/tmp/libs/awesome-cordova/awesome-cordova-core.umd.js',
            format : 'umd',
            name: 'awesomeCordova.core',
            globals: {
                'rxjs': 'rxjs',
                'rxjs/operators': 'rxjs.operators',
                'rxjs/observable/fromEvent': 'rxjs',
                'rxjs/Observable': 'rxjs',
                'rxjs/observable/throw' : 'rxjs',
                'rxjs/observable/merge': 'rxjs'
            }
        }
    },
    {
        input: './projects/mobile/awesome-cordova/awesome-cordova-plugins.js',
        external: [ 'rxjs', 'rxjs/operators', 'tslib', '@awesome-cordova-plugins/core', '@angular/core' ],
        output: {
            file : './dist/tmp/libs/awesome-cordova/awesome-cordova-plugins.umd.js',
            format : 'umd',
            name: 'awesomeCordova.plugins',
            globals: {
                '@angular/core': 'ng.core',
                '@awesome-cordova-plugins/core': 'awesomeCordova.core',
                'rxjs': 'rxjs',
                'rxjs/operators': 'rxjs.operators',
                'rxjs/observable/fromEvent': 'rxjs',
                'rxjs/Observable': 'rxjs',
                'rxjs/observable/throw' : 'rxjs',
                'rxjs/observable/merge': 'rxjs',
                'tslib': 'tslib'

            }
        }
    }
];
