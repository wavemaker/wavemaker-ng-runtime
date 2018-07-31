import { rollupGlobals } from '../rollup-utils';

export default {
    input: './dist/tmp/libs/ngx-bootstrap/ngx-bootstrap.es2015.js',
    output: {
        file: './dist/tmp/libs/ngx-bootstrap/ngx-bootstrap.umd.js',
        format: 'umd',
        name: 'ngxBootstrap',
        globals: rollupGlobals
    }
};
