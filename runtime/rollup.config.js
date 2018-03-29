import rollupGlobals from '../rollup-globals';

export default {
    input: './dist/out-tsc/runtime/main.js',
    output: {
        file: './dist/tmp/wm-runtime.umd.js',
        format: 'umd'
    },
    name: 'wm.runtime',
    globals: rollupGlobals
};
