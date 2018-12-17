import { rollupGlobals } from '../rollup-utils';

export default {
    input: './dist/tmp/libs/ng-circle-progress/index.js',
    output: {
        file: './dist/tmp/libs/ng-circle-progress/ng-circle-progress.umd.js',
        format: 'umd',
        name: 'ngCircleProgress',
        globals: rollupGlobals
    }
};
