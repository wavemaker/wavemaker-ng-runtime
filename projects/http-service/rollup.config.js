import { rollupGlobals } from '../rollup-utils';

export default {
    input: 'dist/out-tsc/http-service/index.js',
    output: {
        file: 'dist/tmp/http-service/http-service.umd.js',
        format: 'umd'
    },
    name: 'wm.http',
    globals: rollupGlobals
};