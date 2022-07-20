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
                '@wm/core': 'libraries/core/fesm2015/index.js',
                '@wm/transpiler': 'libraries/transpiler/fesm2015/index.js'
            }),
            nodeResolve({
                jsnext: true,
                main: true
            }),
            commonJS({
                include: 'node_modules/**',
                ignoreGlobal: true
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
                '@wm/core': 'libraries/core/fesm2015/index.js',
                '@wm/transpiler': 'libraries/transpiler/fesm2015/index.js'
            }),
            nodeResolve({
                jsnext: true,
                main: true
            }),
            commonJS({
                include: 'node_modules/**',
                ignoreGlobal: true
            })
        ]
    },
    {
        input: [
            'libraries/core/esm2015/utils/expression-parser.js'
        ],
        output: {
            file: 'dist/transpilation/expression-parser.cjs.js',
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
            })
        ]
    },
    {
        input: [
            'libraries/components/base/esm2015/pipes/custom-pipes.js',
            'libraries/components/base/esm2015/pipes/sanitize.pipe.js',
            'libraries/components/base/esm2015/pipes/trust-as.pipe.js'
        ],
        output: {
            file: 'dist/transpilation/all-pipes.es.js',
            format: 'es'
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
            })
        ]
    },
    {
        input: [
            'libraries/runtime/base/esm2015/services/pipe-provider.service.js'
        ],
        output: {
            file: 'dist/transpilation/pipe-provider.cjs.js',
            format: 'cjs'
        },
        plugins: [
            multiEntry(),
            alias({
                '@wm/components/base': 'dist/transpilation/all-pipes.es.js',
                '@wm/core': 'libraries/core/fesm2015/index.js'
            }),
            nodeResolve({
                jsnext: true,
                main: true
            }),
            commonJS({
                include: 'node_modules/**',
                ignoreGlobal: true
            })
        ]
    }
]
