import rollupGlobals, {rollupExternals} from './rollup-utils.mjs';

export default {
    input: './node_modules/ngx-toastr/fesm2015/ngx-toastr.mjs',
    external: [ ...rollupExternals ],
    output: {
        file: './node_modules/ngx-toastr/bundles/ngx-toastr.umd.js',
        format: 'umd',
        name: 'ngxToastr',
        globals: rollupGlobals
    }
};
