import { rollupGlobals } from '../rollup-utils';

export default {
    input: 'dist/out-tsc/security/index.js',
    output: {
        file: 'dist/tmp/security/security.umd.js',
        format: 'umd'
    },
    name: 'wm.security',
    globals: rollupGlobals
};