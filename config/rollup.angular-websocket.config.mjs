import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
    input: './node_modules/angular2-websocket/angular2-websocket.js',
    output: {
        file: './dist/tmp/libs/angular-websocket/angular-websocket.umd.js',
        format: 'umd',
        name: 'angularWebSocket',
        globals: {
            '@angular/core': 'ng.core',
            'rxjs/Observable': 'rxjs',
            'rxjs/BehaviorSubject': 'rxjs',
            'rxjs/Subject': 'rxjs'
        }
    },
    external: ['@angular/core', 'rxjs/Observable', 'rxjs/BehaviorSubject', 'rxjs/Subject'],
    plugins: [
        nodeResolve({
            jsnext: true,
            main: true
        }),

        commonjs({
            ignoreGlobal: true,
            sourceMap: false
        })
    ]
};
