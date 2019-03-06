import nodeResolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";

export default {
    input: './node_modules/angular2-text-mask/dist/angular2TextMask.js',
    output: {
        file: './dist/tmp/libs/angular2-text-mask/angular2-text-mask.umd.js',
        format: 'umd',
        name: 'angular2TextMask',
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
