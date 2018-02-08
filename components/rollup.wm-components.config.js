export default {
    input: './dist/out-tsc/components/components.module.js',
    output: {
        file: './dist/tmp/wm-components.umd.js',
        format: 'umd'
    },
    name: 'wm.components',
    globals: {
        '@angular/core': 'ng.core',
        '@angular/common': 'ng.common',
        '@angular/common/http': 'ng.common',
        '@angular/platform-browser-dynamic': 'ng.platformBrowserDynamic',
        '@angular/platform-browser': 'ng.platformBrowser',
        '@angular/forms': 'ng.forms',
        '@angular/router': 'ng.router',
        '@utils/dom': 'wm.utils',
        '@utils/utils': 'wm.utils',
        '@utils/styler': 'wm.utils',
        '@utils/watcher': 'wm.utils',
        '@utils/expression-parser': 'wm.utils',
        'ngx-bootstrap': 'ngxBootstrap',
        'ngx-color-picker': 'zef.ngxColorPicker',
        'rxjs/Subject': 'Rx',
        'lit-html/lit-html': 'litHtml'
    }
};