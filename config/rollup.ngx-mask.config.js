import { rollupGlobals } from '../rollup-utils';

export default {
    input: './dist/tmp/libs/ngx-mask/ngx-mask.js',
    output: {
        file: './dist/tmp/libs/ngx-mask/ngx-mask.umd.js',
        format: 'umd',
        name: 'ngxMask',
        globals: rollupGlobals
    }
};
