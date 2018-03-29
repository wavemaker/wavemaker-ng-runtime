import rollupGlobals from '../rollup-globals';

export default {
    input: './dist/out-tsc/transpiler/index.js',
    output: {
        file: './dist/tmp/wm-transpiler.umd.js',
        format: 'umd'
    },
    name: 'wm.transpiler',
    globals: rollupGlobals
};