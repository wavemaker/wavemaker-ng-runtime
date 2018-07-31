import rollupGlobals from '../../rollup-globals';

export default {
    input: 'mobile/offline/dist/out-tsc/index.js',
    output: {
        file: 'mobile/offline/dist/wm-offline.umd.js',
        format: 'umd',
        name: 'wm.mobile.offline',
        globals: rollupGlobals
    }
};