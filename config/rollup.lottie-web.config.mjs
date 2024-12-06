import rollupGlobals, { rollupExternals } from './rollup-utils.mjs';

export default {
    input: './node_modules/lottie-web/build/player/lottie.min.js',
    external: [...rollupExternals],
    output: {
        file: './dist/tmp/libs/lottie-web/lottie-web.umd.js',
        format: 'umd',
        name: 'lottie',
        globals: rollupGlobals
    }
};