import rollupGlobals from '../rollup-globals';

export default {
    input: 'security/dist/out-tsc/index.js',
    output: {
        file: 'security/dist/wm-security.umd.js',
        format: 'umd'
    },
    name: 'wm.security',
    globals: rollupGlobals
};