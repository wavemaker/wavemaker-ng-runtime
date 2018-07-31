import { rollupGlobals } from '../rollup-utils';

export default {
    input: 'dist/out-tsc/oAuth/index.js',
    output: {
        file: 'dist/tmp/oAuth/oAuth.umd.js',
        format: 'umd'
    },
    name: 'wm.oAuth',
    globals: rollupGlobals
};