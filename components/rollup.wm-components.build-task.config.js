import rollupGlobals from '../rollup-globals';

export default {
    input: './dist/out-tsc/components/src/build-task.js',
    output: {
        file: './dist/tmp/wm-components.build-task.umd.js',
        format: 'umd',
        name: 'wm.components.build',
        globals: rollupGlobals
    }
};