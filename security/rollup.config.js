import rollupGlobals from '../rollup-globals';

export default {
    input: './dist/out-tsc/security/index.js',
    output: {
        file: './dist/tmp/wm-security.umd.js',
        format: 'umd'
    },
    name: 'wm.security',
    globals: rollupGlobals
};