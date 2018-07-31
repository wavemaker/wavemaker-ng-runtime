import { rollupGlobals } from '../rollup-utils';

export default {
    input: 'dist/out-tsc/transpiler/index.js',
    output: {
        file: 'dist/tmp/transpiler/transpiler.umd.js',
        format: 'umd'
    },
    name: 'wm.transpiler',
    globals: rollupGlobals
};