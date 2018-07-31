import { rollupGlobals } from '../rollup-utils';

export default {
    input: 'dist/out-tsc/core/index.js',
    output: {
        file: 'dist/tmp/core/core.umd.js',
        format: 'umd'
    },
    name: 'wm.core',
    globals: rollupGlobals
};