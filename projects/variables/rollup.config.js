import { rollupGlobals } from '../rollup-utils';

export default {
    input: 'dist/out-tsc/variables/index.js',
    output: {
        file: 'dist/tmp/variables/variables.umd.js',
        format: 'umd'
    },
    name: 'wm.variables',
    globals: rollupGlobals
};