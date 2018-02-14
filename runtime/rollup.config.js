export default {
    input: './dist/out-tsc/runtime/main.js',
    output: {
        file: './dist/tmp/wm-runtime.umd.js',
        format: 'umd'
    },
    name: 'wm.runtime',
    globals: {
        '@angular/core': 'ng.core',
        '@angular/compiler': 'ng.compiler',
        '@angular/common': 'ng.common',
        '@angular/common/http': 'ng.common.http',
        '@angular/platform-browser-dynamic': 'ng.platformBrowserDynamic',
        '@angular/platform-browser': 'ng.platformBrowser',
        '@angular/forms': 'ng.forms',
        '@angular/router': 'ng.router',
        '@utils/dom': 'wm.utils',
        '@utils/utils': 'wm.utils',
        '@utils/styler': 'wm.utils',
        '@utils/watcher': 'wm.utils',
        '@utils/expression-parser': 'wm.utils',
        '@components/components.module': 'wm.components',
        '@variables/variables.module': 'wm.variables',
        '@variables/services/variables.service': 'wm.variables',
        '@variables/services/metadata-service/metadata.service': 'wm.variables',
        '@http-service/http-service.module': 'http-service',
        '@http-service/http.service': 'http-service',
        '@transpiler/build': 'wm.transpiler'
    }
};
