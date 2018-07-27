import rollupGlobals from '../rollup-globals';

export default {
    input: './transpiler/dist/out-tsc/index.js',
    output: {
        file: './transpiler/dist/wm-transpiler.umd.js',
        format: 'umd'
    },
    name: 'wm.transpiler',
    globals: rollupGlobals
};