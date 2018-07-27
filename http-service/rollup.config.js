import rollupGlobals from '../rollup-globals';

export default {
    input: 'http-service/dist/out-tsc/index.js',
    output: {
        file: 'http-service/dist/http-service.umd.js',
        format: 'umd'
    },
    name: 'wm.http',
    globals: rollupGlobals
};