import rollupGlobals from '../../../rollup-globals';

export default {
    input: 'mobile/placeholder/components/dist/out-tsc/index.js',
    output: {
        file: 'mobile/placeholder/components/dist/wm-components.umd.js',
        format: 'umd',
        name: 'wm.mobile.components',
        globals: rollupGlobals
    }
}