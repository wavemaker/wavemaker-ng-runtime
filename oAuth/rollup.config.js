import rollupGlobals from '../rollup-globals';

export default {
    input: 'oAuth/dist/out-tsc/index.js',
    output: {
        file: 'oAuth/dist/oAuth.umd.js',
        format: 'umd'
    },
    name: 'wm.oAuth',
    globals: rollupGlobals
};