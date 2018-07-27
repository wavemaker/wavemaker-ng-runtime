import rollupGlobals from '../../rollup-globals';

export default {
    input: 'mobile/runtime/dist/out-tsc/index.js',
    output: {
        file: 'mobile/runtime/dist/wm-runtime.umd.js',
        format: 'umd',
        name: 'wm.mobile.runtime',
        globals: rollupGlobals
    }
};
