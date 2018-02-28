export default {
    input: './dist/out-tsc/variables/variables.module.js',
    output: {
        file: './dist/tmp/wm-variables.umd.js',
        format: 'umd'
    },
    name: 'wm.variables',
    globals: {
        '@angular/core': 'ng.core',
        '@angular/common': 'ng.common',
        '@angular/compiler': 'ng.compiler',
        '@angular/platform-browser-dynamic': 'ng.platformBrowserDynamic',
        '@angular/platform-browser': 'ng.platformBrowser',
        '@angular/forms': 'ng.forms',
        '@angular/router': 'ng.router',
        '@angular/common/http': 'ng.common.http',
        '@utils/watcher': 'wm.utils',
        '@utils/expression-parser': 'wm.utils',
        '@utils/utils': 'wm.utils',
        '@variables/variables.module': 'wm.variables',
        '@variables/services/variables.service': 'wm.variables',
        '@variables/constants/variables.constants': 'wm.variables',
        '@variables/utils/variables.utils': 'wm.variables',
        '@variables/services/metadata-service/metadata.service': 'wm.variables',
        '@variables/services/static-variable/static-variable': 'wm.variables',
        '@variables/services/service-variable/service-variable': 'wm.variables',
        '@variables/services/live-variable/live-variable.utils': 'wm.variables',
        '@variables/services/live-variable/live-variable.http.utils': 'wm.variables'
    }
};