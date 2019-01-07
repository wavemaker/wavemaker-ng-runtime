import { rollupGlobals } from '../rollup-utils';

export default {
    input: 'dist/out-tsc/swipey/index.js',
    output: {
        file: 'dist/tmp/swipey/swipey.umd.js',
        format: 'umd'
    },
    name: 'swipey',
    globals: rollupGlobals
};