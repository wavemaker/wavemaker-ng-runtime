import rollupGlobals from '../../rollup-globals';

export default {
    input: './dist/out-tsc/mobile/components/index.js',
    output: {
        file: './dist/tmp/mobile/wm-components.umd.js',
        format: 'umd'
    },
    name: 'wm.mobile.components',
    globals: rollupGlobals
};