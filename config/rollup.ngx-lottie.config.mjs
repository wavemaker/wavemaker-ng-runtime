import rollupGlobals, { rollupExternals } from './rollup-utils.mjs';

export default {
    input: './node_modules/ngx-lottie/fesm2015/ngx-lottie.mjs',
    external: [...rollupExternals],
    output: {
        file: './dist/tmp/libs/ngx-lottie/ngx-lottie.umd.js',
        format: 'umd',
        name: 'ngxLottie',
        globals: rollupGlobals
    }
};