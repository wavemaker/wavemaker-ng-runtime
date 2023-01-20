import rollupGlobals, {rollupExternals} from './rollup-utils.mjs';

export default [
    {
        input: './node_modules/ngx-color-picker/fesm2015/ngx-color-picker.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './node_modules/ngx-color-picker/bundles/ngx-color-picker.umd.js',
            format: 'umd',
            name: 'ngxColorpicker',
            globals: rollupGlobals
        }
    },
    {
        input: './node_modules/angular-imask/fesm2015/angular-imask.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './node_modules/angular-imask/bundles/angular-imask.umd.js',
            format: 'umd',
            name: 'IMask',
            globals: rollupGlobals
        }
    }
];
