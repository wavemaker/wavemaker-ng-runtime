import rollupGlobals from '../rollup-globals';

export default {
    input: './dist/out-tsc/http-service/index.js',
    output: {
        file: './dist/tmp/http-service.umd.js',
        format: 'umd'
    },
    name: 'wm.http',
    globals: rollupGlobals
};