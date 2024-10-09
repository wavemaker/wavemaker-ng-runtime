import multi from '@rollup/plugin-multi-entry';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import alias from '@rollup/plugin-alias';

export default [
    {
        input: 'libraries/build-task/fesm2022/index.mjs',
        output: {
            file: 'dist/transpilation/transpilation-web.cjs.js',
            format: 'cjs'
        },
        plugins: [
            alias({
                entries: [
                    { find: 'rxjs/Subject', replacement: 'node_modules/rxjs/_esm5/internal/Subject.js' },
                    { find: '@wm/core', replacement: 'libraries/core/fesm2022/index.mjs' },
                    { find: '@wm/transpiler', replacement: 'libraries/transpiler/fesm2022/index.mjs' }
                ]
            }),
            nodeResolve({
                jsnext: true,
                main: true
            }),
            commonjs({
                include: 'node_modules/**',
                ignoreGlobal: true
            })
        ]
    },
    {
        input: [
            'libraries/build-task/fesm2022/index.mjs',
            'libraries/mobile-build-task/fesm2022/index.mjs'
        ],
        output: {
            file: 'dist/transpilation/transpilation-mobile.cjs.js',
            format: 'cjs'
        },
        plugins: [
            multi(),
            alias({
                entries: [
                    { find: 'rxjs/Subject', replacement: 'node_modules/rxjs/_esm5/internal/Subject.js' },
                    { find: '@wm/core', replacement: 'libraries/core/fesm2022/index.mjs' },
                    { find: '@wm/transpiler', replacement: 'libraries/transpiler/fesm2022/index.mjs' }
                ]
            }),
            nodeResolve({
                jsnext: true,
                main: true
            }),
            commonjs({
                include: 'node_modules/!**',
                ignoreGlobal: true
            })
        ]
    },
    {
        input: [
            'libraries/core/esm2022/utils/expression-parser.mjs'
        ],
        output: {
            file: 'dist/transpilation/expression-parser.cjs.js',
            format: 'cjs'
        },
        plugins: [
            multi(),
            nodeResolve({
                jsnext: true,
                main: true
            }),
            commonjs({
                include: 'node_modules/**',
                ignoreGlobal: true
            })
        ]
    },
    {
        input: [
            'libraries/components/base/esm2022/pipes/custom-pipes.mjs',
            'libraries/components/base/esm2022/pipes/sanitize.pipe.mjs',
            'libraries/components/base/esm2022/pipes/trust-as.pipe.mjs'
        ],
        output: {
            file: 'dist/transpilation/all-pipes.es.js',
            format: 'es'
        },
        plugins: [
            multi(),
            alias({
                entries: [
                    { find: '@wm/core', replacement: 'libraries/core/fesm2022/index.mjs' }
                ]
            }),
            nodeResolve({
                jsnext: true,
                main: true
            }),
            commonjs({
                include: 'node_modules/**',
                ignoreGlobal: true
            })
        ]
    },
    {
        input: [
            'libraries/runtime/base/esm2022/services/pipe-provider.service.mjs'
        ],
        output: {
            file: 'dist/transpilation/pipe-provider.cjs.js',
            format: 'cjs'
        },
        plugins: [
            multi(),
            alias({
                entries: [
                    { find: 'rxjs/Subject', replacement: 'node_modules/rxjs/_esm5/internal/Subject.js' },
                    { find: '@wm/components/base', replacement: 'dist/transpilation/all-pipes.es.js' },
                    { find: '@wm/core', replacement: 'libraries/core/fesm2022/index.mjs' }
                ]
            }),
            nodeResolve({
                jsnext: true,
                main: true
            }),
            commonjs({
                include: 'node_modules/**',
                ignoreGlobal: true
            })
        ]
    }
]
