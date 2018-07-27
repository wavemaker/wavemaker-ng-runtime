import rollupGlobals from '../rollup-globals';

export default [
    {
        input: 'components/dist/out-tsc/index.js',
        output: {
            file: 'components/dist//wm-components.umd.js',
            format: 'umd',
            name: 'wm.components',
            globals: rollupGlobals
        }
    },
    {
        input: 'components/dist/out-tsc/src/build-task.js',
        output: {
            file: 'components/dist/wm-components.build-task.umd.js',
            format: 'umd',
            name: 'wm.components.build',
            globals: rollupGlobals
        }
    }
]