import rollupGlobals, {rollupExternals} from './rollup-utils.mjs';

export default {
    input: './node_modules/ng-circle-progress/fesm2020/ng-circle-progress.mjs',
    external: [ ...rollupExternals ],
    output: {
        file: './dist/tmp/libs/ng-circle-progress/ng-circle-progress.umd.js',
        format: 'umd',
        name: 'ngCircleProgress',
        globals: rollupGlobals
    }
};
