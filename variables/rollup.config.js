import rollupGlobals from '../rollup-globals';

export default {
    input: 'variables/dist/out-tsc/index.js',
    output: {
        file: 'variables/dist/wm-variables.umd.js',
        format: 'umd'
    },
    name: 'wm.variables',
    globals: rollupGlobals
};