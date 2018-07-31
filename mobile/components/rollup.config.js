import { rollupGlobals } from '../../rollup-utils';

export default [
    {
        input: 'dist/out-tsc/mobile/components/index.js',
        output: {
            file: 'dist/tmp/mobile/components/components.umd.js',
            format: 'umd',
            name: 'wm.mobile.components',
            globals: rollupGlobals
        }
    },
    {
        input: 'dist/out-tsc/mobile/components/src/build-task.js',
        output: {
            file: 'dist/tmp/mobile/components/build-task.umd.js',
            format: 'umd',
            name: 'wm.mobile.components.build',
            globals: rollupGlobals
        }
    }
]