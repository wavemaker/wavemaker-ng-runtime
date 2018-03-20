export default {
    input: './dist/out-tsc/components/build.js',
    output: {
        file: './dist/tmp/wm-components.build.umd.js',
        format: 'umd'
    },
    name: 'wm.components.build',
    globals: {
        '@transpiler/build': 'wm.transpiler',
        '@utils/utils': 'wm.utils'
    }
};