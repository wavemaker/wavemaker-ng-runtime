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
        '@angular/animations': 'ng.animations',
        '@angular/animations/browser': 'ng.animations.browser',
        '@angular/platform-browser-dynamic': 'ng.platformBrowserDynamic',
        '@angular/platform-browser': 'ng.platformBrowser',
        '@angular/platform-browser/animations': 'ng.platformBrowser.animations',
        '@angular/forms': 'ng.forms',
        '@angular/router': 'ng.router',
        '@angular/common/http': 'ng.common.http',
        '@utils/watcher': 'wm.utils',
        '@utils/expression-parser': 'wm.utils',
        '@utils/utils': 'wm.utils',

        '@variables/variables.module': 'wm.variables',
        '@variables/service/variables.service': 'wm.variables',
        '@variables/service/metadata-service/metadata.service': 'wm.variables',

        '@variables/class/live-variable': 'wm.variables',
        '@variables/class/model-variable': 'wm.variables',
        '@variables/class/navigation-variable': 'wm.variables',
        '@variables/class/notification-variable': 'wm.variables',
        '@variables/class/service-variable': 'wm.variables',

        '@variables/constants/variables.constants': 'wm.variables',

        '@variables/factory/variable.factory': 'wm.variables',
        '@variables/factory/variable-manager.factory': 'wm.variables',

        '@variables/manager/variable.manager': 'wm.variables',
        '@variables/manager/model-variable.manager': 'wm.variables',
        '@variables/manager/service-variable.manager': 'wm.variables',

        '@variables/utils/variables.utils': 'wm.variables',
        '@variables/utils/inflight-queue': 'wm.variables',
        '@variables/utils/live-variable.http.util': 'wm.variables',
        '@variables/utils/live-variable.util': 'wm.variables',
        '@variables/utils/model-variable.util': 'wm.variables',
        '@variables/utils/navigation-variable.util': 'wm.variables',
        '@variables/utils/notification-variable.util': 'wm.variables',
        '@variables/utils/service-variable.util': 'wm.variables'
    }
};