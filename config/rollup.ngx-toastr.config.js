import rollupGlobals from '../rollup-globals';

export default {
    input: './dist/tmp/ngx-toastr.js',
    output: {
        file: './dist/tmp/ngx-toastr.umd.js',
        format: 'umd',
        name: 'ngxToastr',
        globals: rollupGlobals
    }
};
