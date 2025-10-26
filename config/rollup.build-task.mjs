import multi from '@rollup/plugin-multi-entry';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import alias from '@rollup/plugin-alias';
import typescript from '@rollup/plugin-typescript';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
                    { find: 'rxjs/Subject', replacement: path.resolve(__dirname, '..', 'node_modules/rxjs/_esm5/internal/Subject.js') },
                    { find: '@wm/core', replacement: path.resolve(__dirname, '..', 'libraries/core/fesm2022/index.mjs') },
                    { find: '@wm/transpiler', replacement: path.resolve(__dirname, '..', 'libraries/transpiler/fesm2022/index.mjs') }
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
            'projects/core/src/utils/expression-parser.ts'
        ],
        output: {
            file: 'dist/transpilation/expression-parser.cjs.js',
            format: 'cjs',
            exports: 'named'
        },
        plugins: [
            multi(),
            typescript({
                tsconfig: './projects/core/tsconfig.lib.json',
                declaration: false,
                outDir: 'dist/transpilation',
                rootDir: '.'
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
            'projects/components/base/src/pipes/custom-pipes.ts',
            'projects/components/base/src/pipes/sanitize.pipe.ts',
            'projects/components/base/src/pipes/trust-as.pipe.ts'
        ],
        output: {
            file: 'dist/transpilation/all-pipes.es.js',
            format: 'es'
        },
        plugins: [
            multi(),
            typescript({
                tsconfig: './projects/components/base/tsconfig.lib.json',
                declaration: false,
                outDir: 'dist/transpilation',
                rootDir: '.',
                exclude: ['**/*.spec.ts', '**/test/**', '**/public_api_buildtask.ts']
            }),
            alias({
                entries: [
                    { find: '@wm/core', replacement: path.resolve(__dirname, '..', 'libraries/core/fesm2022/index.mjs') }
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
            'projects/runtime-base/src/services/pipe-provider.service.ts'
        ],
        output: {
            file: 'dist/transpilation/pipe-provider.cjs.js',
            format: 'cjs',
            exports: 'named'
        },
        plugins: [
            multi(),
            typescript({
                tsconfig: './projects/runtime-base/tsconfig.lib.json',
                declaration: false,
                outDir: 'dist/transpilation',
                rootDir: '.'
            }),
            alias({
                entries: [
                    { find: 'rxjs/Subject', replacement: path.resolve(__dirname, '..', 'node_modules/rxjs/_esm5/internal/Subject.js') },
                    { find: '@wm/components/base', replacement: path.resolve(__dirname, '..', 'dist/transpilation/all-pipes.es.js') },
                    { find: '@wm/core', replacement: path.resolve(__dirname, '..', 'libraries/core/fesm2022/index.mjs') }
                ]
            }),
            nodeResolve({
                jsnext: true,
                main: true,
                preferBuiltins: false
            }),
            commonjs({
                include: 'node_modules/**',
                ignoreGlobal: true
            })
        ]
    }
]
