import rollupGlobals from '../rollup-globals';

export default {
    input: './dist/out-tsc/variables/index.js',
    output: {
        file: './dist/tmp/wm-variables.umd.js',
        format: 'umd'
    },
    name: 'wm.variables',
    globals: rollupGlobals
};