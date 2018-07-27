import rollupGlobals from '../rollup-globals';

export default {
    input: 'runtime/dist/out-tsc/index.js',
    output: {
        file: 'runtime/dist/wm-runtime.umd.js',
        format: 'umd',
        name: 'wm.runtime',
        globals: rollupGlobals
    }
};
