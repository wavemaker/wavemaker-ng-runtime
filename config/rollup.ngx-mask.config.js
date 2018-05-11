import rollupGlobals from '../rollup-globals';

export default {
    input: './dist/tmp/ngx-mask.js',
    output: {
        file: './dist/tmp/ngx-mask.umd.js',
        format: 'umd'
    },
    name: 'ngxMask',
    globals: rollupGlobals
};
