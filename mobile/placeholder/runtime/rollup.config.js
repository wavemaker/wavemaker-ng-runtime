import rollupGlobals from '../../../rollup-globals';

export default {
    input: 'mobile/placeholder/runtime/dist/out-tsc/index.js',
    output: {
        file: 'mobile/placeholder/runtime/dist/wm-runtime.umd.js',
        format: 'umd',
        name: 'wm.mobile.runtime',
        globals: rollupGlobals
    }
};
