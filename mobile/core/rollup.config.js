import rollupGlobals from '../../rollup-globals';

export default {
    input: './dist/out-tsc/mobile/core/index.js',
    output: {
        file: './dist/tmp/mobile/wm-core.umd.js',
        format: 'umd'
    },
    name: 'wm.mobile.core',
    globals: rollupGlobals
};
