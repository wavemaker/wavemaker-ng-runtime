import { rollupGlobals } from '../../../rollup-utils';

export default {
    input: 'dist/out-tsc/mobile/placeholder/runtime/index.js',
    output: {
        file: 'dist/tmp/mobile/placeholder/runtime/runtime.umd.js',
        format: 'umd',
        name: 'wm.mobile.runtime',
        globals: rollupGlobals
    }
};
