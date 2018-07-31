import { rollupGlobals } from '../../rollup-utils';

export default {
    input: 'dist/out-tsc/mobile/variables/index.js',
    output: {
        file: 'dist/tmp/mobile/variables/variables.umd.js',
        format: 'umd',
        name: 'wm.mobile.variables',
        globals: rollupGlobals
    }
};
