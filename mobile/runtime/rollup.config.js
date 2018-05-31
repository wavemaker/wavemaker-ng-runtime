import rollupGlobals from '../../rollup-globals';

export default {
    input: './dist/out-tsc/mobile/runtime/index.js',
    output: {
        file: './dist/tmp/mobile/wm-runtime.umd.js',
        format: 'umd',
        name: 'wm.mobile.runtime',
        globals: rollupGlobals
    }
};
