export default {
    input: './dist/out-tsc/transpiler/build.js',
    output: {
        file: './dist/tmp/wm-transpiler.umd.js',
        format: 'umd'
    },
    name: 'wm.transpiler',
    globals: {
        '@angular/compiler': 'ng.compiler'
    }
};