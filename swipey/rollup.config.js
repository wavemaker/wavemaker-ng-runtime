import rollupGlobals from '../rollup-globals';

export default {
    input: './dist/out-tsc/swipey/index.js',
    output: {
        file: './dist/tmp/swipey.umd.js',
        format: 'umd'
    },
    name: 'swipey',
    globals: rollupGlobals
};