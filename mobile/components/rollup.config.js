import rollupGlobals from '../../rollup-globals';

export default [
    {
        input: 'mobile/components/dist/out-tsc/index.js',
        output: {
            file: 'mobile/components/dist/wm-components.umd.js',
            format: 'umd',
            name: 'wm.mobile.components',
            globals: rollupGlobals
        }
    },
    {
        input: 'mobile/components/dist/out-tsc/src/build-task.js',
        output: {
            file: 'mobile/components/dist/wm-components.build-task.umd.js',
            format: 'umd',
            name: 'wm.mobile.components.build',
            globals: rollupGlobals
        }
    }
]