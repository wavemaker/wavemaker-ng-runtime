import rollupGlobals from '../../rollup-globals';

export default {
    input: './dist/out-tsc/mobile/variables/index.js',
    output: {
        file: './dist/tmp/mobile/wm-variables.umd.js',
        format: 'umd',
        name: 'wm.mobile.variables',
        globals: rollupGlobals
    }
};
