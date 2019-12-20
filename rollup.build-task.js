import multiEntry from 'rollup-plugin-multi-entry';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonJS from 'rollup-plugin-commonjs';
import alias from 'rollup-plugin-alias';
import compiler from '@ampproject/rollup-plugin-closure-compiler';

export default [
    {
        input: 'libraries/build-task/fesm2015/index.js',
        output: {
            file: 'dist/transpilation/transpilation-web.cjs.js',
            format: 'cjs'
        },
        plugins: [
            alias({
                'rxjs/Subject': 'node_modules/rxjs/_esm5/internal/Subject.js',
                '@wm/core': 'libraries/core/fesm5/index.js',
                '@wm/transpiler': 'libraries/transpiler/fesm5/index.js'
            }),
            nodeResolve({
                jsnext: true,
                main: true
            }),
            commonJS({
                include: 'node_modules/**',
                ignoreGlobal: true
            }),
            compiler({
                formatting: 'PRETTY_PRINT'
            })
        ]
    },
    {
        input: [
            'libraries/build-task/fesm2015/index.js',
            'libraries/mobile-build-task/fesm2015/index.js'
        ],
        output: {
            file: 'dist/transpilation/transpilation-mobile.cjs.js',
            format: 'cjs'
        },
        plugins: [
            multiEntry(),
            alias({
                'rxjs/Subject': 'node_modules/rxjs/_esm5/internal/Subject.js',
                '@wm/core': 'libraries/core/fesm5/index.js',
                '@wm/transpiler': 'libraries/transpiler/fesm5/index.js'
            }),
            nodeResolve({
                jsnext: true,
                main: true
            }),
            commonJS({
                include: 'node_modules/**',
                ignoreGlobal: true
            }),
            compiler({
                formatting: 'PRETTY_PRINT'
            })
        ]
    }
]
