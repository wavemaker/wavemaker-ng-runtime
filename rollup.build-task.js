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
            nodeResolve({
                jsnext: true,
                main: true
            }),
            commonJS({
                include: 'node_modules/**',
                ignoreGlobal: true
            }),
            alias({
                '@wm/core': 'libraries/core/fesm5/index.js',
                '@wm/transpiler': 'libraries/transpiler/fesm5/index.js'
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
            nodeResolve({
                jsnext: true,
                main: true
            }),
            commonJS({
                include: 'node_modules/**',
                ignoreGlobal: true
            }),
            alias({
                '@wm/core': 'libraries/core/fesm5/index.js',
                '@wm/transpiler': 'libraries/transpiler/fesm5/index.js'
            }),
            compiler({
                formatting: 'PRETTY_PRINT'
            })
        ]
    }
]
