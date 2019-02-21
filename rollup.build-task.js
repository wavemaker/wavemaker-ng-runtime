import multiEntry from 'rollup-plugin-multi-entry';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonJS from 'rollup-plugin-commonjs';
import alias from 'rollup-plugin-alias';
import compiler from '@ampproject/rollup-plugin-closure-compiler';

export default [
    {
        input: 'dist/npm-packages/wm/build-task/fesm2015/index.js',
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
                '@wm/core': 'dist/npm-packages/wm/core/fesm5/index.js',
                '@wm/transpiler': 'dist/npm-packages/wm/transpiler/fesm5/index.js'
            }),
            compiler({
                formatting: 'PRETTY_PRINT'
            })
        ]
    },
    {
        input: [
            'dist/npm-packages/wm/build-task/fesm2015/index.js',
            'dist/npm-packages/wm/mobile-build-task/fesm2015/index.js'
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
                '@wm/core': 'dist/npm-packages/wm/core/fesm5/index.js',
                '@wm/transpiler': 'dist/npm-packages/wm/transpiler/fesm5/index.js'
            }),
            compiler({
                formatting: 'PRETTY_PRINT'
            })
        ]
    }
]
