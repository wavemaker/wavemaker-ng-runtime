import { rollupGlobals } from '../rollup-utils';

export default {
    input: 'dist/out-tsc/runtime/index.js',
    output: {
        file: 'dist/tmp/runtime/runtime.umd.js',
        format: 'umd',
        name: 'wm.runtime',
        globals: rollupGlobals
    }
};
