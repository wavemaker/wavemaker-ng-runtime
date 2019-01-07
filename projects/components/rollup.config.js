import { rollupGlobals } from '../rollup-utils';

export default [
    {
        input: 'dist/out-tsc/components/index.js',
        output: {
            file: 'dist/tmp/components/components.umd.js',
            format: 'umd',
            name: 'wm.components',
            globals: rollupGlobals
        }
    },
    {
        input: 'dist/out-tsc/components/src/build-task.js',
        output: {
            file: 'dist/tmp/components/build-task.umd.js',
            format: 'umd',
            name: 'wm.components.build',
            globals: rollupGlobals
        }
    }
]