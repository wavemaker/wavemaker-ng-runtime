import rollupGlobals from '../rollup-globals';

export default {
    input: './dist/out-tsc/utils/index.js',
    output: {
        file: './dist/tmp/wm-utils.umd.js',
        format: 'umd'
    },
    name: 'wm.utils',
    globals: rollupGlobals
};