import rollupGlobals from '../../rollup-globals';

export default {
    input: 'mobile/variables/dist/out-tsc/index.js',
    output: {
        file: 'mobile/variables/dist/wm-variables.umd.js',
        format: 'umd',
        name: 'wm.mobile.variables',
        globals: rollupGlobals
    }
};
