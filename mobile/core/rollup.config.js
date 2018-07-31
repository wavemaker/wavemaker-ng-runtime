import { rollupGlobals } from '../../rollup-utils';

export default {
    input: 'dist/out-tsc/mobile/core/index.js',
    output: {
        file: 'dist/tmp/mobile/core/core.umd.js',
        format: 'umd'
    },
    name: 'wm.mobile.core',
    globals: rollupGlobals
};
