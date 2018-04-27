import rollupGlobals from '../../rollup-globals';

export default {
    input: './dist/out-tsc/mobile/components/src/build-task.js',
    output: {
        file: './dist/tmp/mobile/wm-components.build-task.umd.js',
        format: 'umd'
    },
    name: 'wm.mobile.components.build',
    globals: rollupGlobals
};