import rollupGlobals from '../rollup-globals';

export default {
    input: './core/dist/out-tsc/index.js',
    output: {
        file: './core/dist/wm-core.umd.js',
        format: 'umd'
    },
    name: 'wm.core',
    globals: rollupGlobals
};