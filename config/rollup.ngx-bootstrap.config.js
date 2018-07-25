import rollupGlobals from '../rollup-globals';

export default {
    input: './dist/tmp/ngx-bootstrap.es2015.js',
    output: {
        file: './dist/tmp/ngx-bootstrap.umd.js',
        format: 'umd',
        name: 'ngxBootstrap',
        globals: rollupGlobals
    }
};
