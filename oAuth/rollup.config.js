import rollupGlobals from '../rollup-globals';

export default {
    input: './dist/out-tsc/oAuth/index.js',
    output: {
        file: './dist/tmp/oAuth.umd.js',
        format: 'umd'
    },
    name: 'wm.oAuth',
    globals: rollupGlobals
};