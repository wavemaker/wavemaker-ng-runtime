import { rollupGlobals } from '../rollup-utils';

export default {
    input: './dist/tmp/libs/ngx-toastr/ngx-toastr.js',
    output: {
        file: './dist/tmp/libs/ngx-toastr/ngx-toastr.umd.js',
        format: 'umd',
        name: 'ngxToastr',
        globals: rollupGlobals
    }
};
