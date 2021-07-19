import multiEntry from '@rollup/plugin-multi-entry';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonJS from '@rollup/plugin-commonjs';
import alias from '@rollup/plugin-alias';
import compiler from '@ampproject/rollup-plugin-closure-compiler';
import { terser } from "rollup-plugin-terser";

export default [
    {
        input: './libraries/build-task/fesm2015/index.js',
        output: {
            file: './dist/transpilation/transpilation-web.cjs.js',
            format: 'cjs'
        },
        acorn: {
            allowReserved: false
        },
        plugins: [
            alias({
                entries: [
                    {'find': 'rxjs/Subject', 'replacement': './node_modules/rxjs/_esm5/internal/Subject.js'},
                    {'find': '@wm/core', 'replacement': './libraries/core/fesm2015/index.js'},
                    {'find': '@wm/transpiler', 'replacement': './libraries/transpiler/fesm2015/index.js'}
                ]
            }),
            nodeResolve({
                mainFields: ['jsnext', 'module', 'main'],
            }),
            commonJS({
                include: './node_modules/**',
                ignoreGlobal: true
            }),
            terser()
            // compiler()
        ]
    },
    {
        input: [
            './libraries/build-task/fesm2015/index.js',
            './libraries/mobile-build-task/fesm2015/index.js'
        ],
        output: {
            file: './dist/transpilation/transpilation-mobile.cjs.js',
            format: 'cjs'
        },
        acorn: {
            allowReserved: true
        },
        plugins: [
            multiEntry(),
            alias({
                entries: [
                    {'find': 'rxjs/Subject', 'replacement': './node_modules/rxjs/_esm5/internal/Subject.js'},
                    {'find': '@wm/core', 'replacement': './libraries/core/fesm2015/index.js'},
                    {'find': '@wm/transpiler', 'replacement': './libraries/transpiler/fesm2015/index.js'}
                ]
            }),
            nodeResolve({
                mainFields: ['module', 'main']
            }),
            commonJS({
                include: 'node_modules/!**',
                ignoreGlobal: true
            }),
            terser()
            /*compiler({
                formatting: 'PRETTY_PRINT'
            })*/
        ]
    }
]
