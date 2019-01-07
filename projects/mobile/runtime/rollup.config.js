import { rollupGlobals } from '../../rollup-utils';

export default {
    input: 'dist/out-tsc/mobile/runtime/index.js',
    output: {
        file: 'dist/tmp/mobile/runtime/runtime.umd.js',
        format: 'umd',
        name: 'wm.mobile.runtime',
        globals: rollupGlobals
    }
};
