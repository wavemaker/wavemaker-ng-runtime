import rollupGlobals from '../../rollup-globals';

export default {
    input: 'mobile/core/dist/out-tsc/index.js',
    output: {
        file: 'mobile/core/dist/wm-core.umd.js',
        format: 'umd'
    },
    name: 'wm.mobile.core',
    globals: rollupGlobals
};
