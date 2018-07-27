import rollupGlobals from '../rollup-globals';

export default {
    input: 'swipey/dist/out-tsc/index.js',
    output: {
        file: 'swipey/dist/swipey.umd.js',
        format: 'umd'
    },
    name: 'swipey',
    globals: rollupGlobals
};