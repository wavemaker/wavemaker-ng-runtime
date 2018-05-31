import rollupGlobals from '../rollup-globals';

export default {
    input: './dist/out-tsc/core/index.js',
    output: {
        file: './dist/tmp/wm-core.umd.js',
        format: 'umd'
    },
    name: 'wm.core',
    globals: rollupGlobals
};