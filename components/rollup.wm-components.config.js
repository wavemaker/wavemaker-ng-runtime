import rollupGlobals from '../rollup-globals';

export default {
    input: './dist/out-tsc/components/index.js',
    output: {
        file: './dist/tmp/wm-components.umd.js',
        format: 'umd'
    },
    name: 'wm.components',
    globals: rollupGlobals
};