const rollupGlobals = {
    '@angular/animations': 'ng.animations',
    '@angular/common': 'ng.common',
    '@angular/common/http': 'ng.common.http',
    '@angular/compiler': 'ng.compiler',
    '@angular/core': 'ng.core',
    '@angular/core/primitives/signals': 'ng.signals',
    '@angular/core/primitives/event-dispatch': 'ng.event-dispatch',
    '@angular/forms': 'ng.forms',
    '@angular/platform-browser-dynamic': 'ng.platformBrowserDynamic',
    '@angular/platform-browser': 'ng.platformBrowser',
    '@angular/platform-browser/animations': 'ng.platformBrowser.animations',
    '@angular/router': 'ng.router',
    '@awesome-cordova-plugins/core/ngx': 'awesomeCordova.core',
    '@awesome-cordova-plugins/file/ngx': 'awesomeCordova.plugins',
    '@awesome-cordova-plugins/app-version/ngx': 'awesomeCordova.plugins',
    '@awesome-cordova-plugins/barcode-scanner/ngx': 'awesomeCordova.plugins',
    '@awesome-cordova-plugins/calendar/ngx': 'awesomeCordova.plugins',
    '@awesome-cordova-plugins/camera/ngx': 'awesomeCordova.plugins',
    '@awesome-cordova-plugins/file-opener/ngx': 'awesomeCordova.plugins',
    '@awesome-cordova-plugins/device/ngx': 'awesomeCordova.plugins',
    '@awesome-cordova-plugins/media-capture/ngx': 'awesomeCordova.plugins',
    '@awesome-cordova-plugins/geolocation/ngx': 'awesomeCordova.plugins',
    '@awesome-cordova-plugins/network/ngx': 'awesomeCordova.plugins',
    '@awesome-cordova-plugins/sqlite/ngx': 'awesomeCordova.plugins',
    '@awesome-cordova-plugins/vibration/ngx': 'awesomeCordova.plugins',
    '@awesome-cordova-plugins/location-accuracy/ngx': 'awesomeCordova.plugins',
    '@awesome-cordova-plugins/diagnostic/ngx': 'awesomeCordova.plugins',
    '@swipey': 'swipey',
    '@wavemaker/focus-trap': 'focusTrap',
    '@wavemaker/variables':'wm_common_variables',
    '@wavemaker/custom-widgets-m3':'wm_custom_widgets',
    '@wm/build-task': 'wm.buildTask',
    '@wm/core': 'wm.core',
    '@wm/transpiler': 'wm.transpiler',
    '@wm/components': 'wm.components',
    '@wm/components/base': 'wm.components.base',
    '@wm/components/input': 'wm.components.input',
    '@wm/components/input/calendar': 'wm.components.input.calendar',
    '@wm/components/input/chips': 'wm.components.input.chips',
    '@wm/components/input/color-picker': 'wm.components.input.colorpicker',
    '@wm/components/input/currency': 'wm.components.input.currency',
    '@wm/components/input/epoch': 'wm.components.input.epoch',
    '@wm/components/input/file-upload': 'wm.components.input.fileupload',
    '@wm/components/input/rating': 'wm.components.input.rating',
    '@wm/components/input/slider': 'wm.components.input.slider',
    '@wm/components/basic': 'wm.components.basic',
    '@wm/components/basic/progress': 'wm.components.basic.progress',
    '@wm/components/basic/rich-text-editor': 'wm.components.basic.richtexteditor',
    '@wm/components/basic/search': 'wm.components.basic.search',
    '@wm/components/basic/tree': 'wm.components.basic.tree',
    '@wm/components/data/card': 'wm.components.data.card',
    '@wm/components/data/form': 'wm.components.data.form',
    '@wm/components/data/list': 'wm.components.data.list',
    '@wm/components/data/live-table': 'wm.components.data.livetable',
    '@wm/components/data/pagination': 'wm.components.data.pagination',
    '@wm/components/data/table': 'wm.components.data.table',
    '@wm/components/chart': 'wm.components.chart',
    '@wm/components/containers/accordion': 'wm.components.containers.accordion',
    '@wm/components/containers/linear-layout': 'wm.components.containers.linearlayout',
    '@wm/components/containers/layout-grid': 'wm.components.containers.layoutgrid',
    '@wm/components/containers/panel': 'wm.components.containers.panel',
    '@wm/components/containers/tabs': 'wm.components.containers.tabs',
    '@wm/components/containers/tile': 'wm.components.containers.tile',
    '@wm/components/containers/wizard': 'wm.components.containers.wizard',
    '@wm/components/dialogs': 'wm.components.dialogs',
    '@wm/components/dialogs/confirm-dialog': 'wm.components.dialogs.confirmdialog',
    '@wm/components/dialogs/design-dialog': 'wm.components.dialogs.designdialog',
    '@wm/components/dialogs/alert-dialog': 'wm.components.dialogs.alertdialog',
    '@wm/components/dialogs/iframe-dialog': 'wm.components.dialogs.iframedialog',
    '@wm/components/dialogs/login-dialog': 'wm.components.dialogs.logindialog',
    '@wm/components/dialogs/partial-dialog': 'wm.components.dialogs.partialdialog',
    '@wm/components/navigation/breadcrumb': 'wm.components.navigation.breadcrumb',
    '@wm/components/navigation/menu': 'wm.components.navigation.menu',
    '@wm/components/navigation/navbar': 'wm.components.navigation.navbar',
    '@wm/components/navigation/popover': 'wm.components.navigation.popover',
    '@wm/components/advanced/carousel': 'wm.components.advanced.carousel',
    '@wm/components/advanced/login': 'wm.components.advanced.login',
    '@wm/components/advanced/marquee': 'wm.components.advanced.marquee',
    '@wm/components/advanced/custom': 'wm.components.advanced.custom',
    '@wm/components/page': 'wm.components.page',
    '@wm/components/page/footer': 'wm.components.page.footer',
    '@wm/components/page/header': 'wm.components.page.header',
    '@wm/components/page/left-panel': 'wm.components.page.leftpanel',
    '@wm/components/page/right-panel': 'wm.components.page.rightpanel',
    '@wm/components/page/top-nav': 'wm.components.page.topnav',
    '@wm/components/prefab': 'wm.components.prefab',
    '@wm/runtime/base': 'wm.runtime.base',
    '@wm/runtime/dynamic': 'wm.runtime.dynamic',
    '@wm/mobile/core': 'wm.mobile.core',
    '@wm/mobile/offline': 'wm.mobile.offline',
    '@wm/mobile/variables': 'wm.mobile.variables',
    '@wm/mobile/runtime': 'wm.mobile.runtime',
    '@wm/mobile/runtime/dynamic': 'wm.mobile.runtime.dynamic',
    '@wm/mobile/placeholder/components': 'wm.mobile.placeholder.components',
    '@wm/mobile/placeholder/runtime': 'wm.mobile.runtime',
    '@wm/mobile/placeholder/runtime/dynamic': 'wm.mobile.runtime.dynamic',
    '@wm/mobile/components': 'wm.mobile.components',
    '@wm/mobile/components/basic': 'wm.mobile.components.basic',
    '@wm/mobile/components/basic/search': 'wm.mobile.components.basic.search',
    '@wm/mobile/components/containers/segmented-control': 'wm.mobile.components.containers.segmentedcontrol',
    '@wm/mobile/components/data/media-list': 'wm.mobile.components.data.medialist',
    '@wm/mobile/components/device/barcode-scanner': 'wm.mobile.components.device.barcodescanner',
    '@wm/mobile/components/device/camera': 'wm.mobile.components.device.camera',
    '@wm/mobile/components/input/file-upload': 'wm.mobile.components.input.fileupload',
    '@wm/mobile/components/page': 'wm.mobile.components.page',
    '@wm/mobile/components/page/left-panel': 'wm.mobile.components.page.leftpanel',
    '@wm/mobile/components/page/mobile-navbar': 'wm.mobile.components.page.mobilenavbar',
    '@wm/mobile/components/page/tab-bar': 'wm.mobile.components.page.tabbar',
    '@wm/http': 'wm.http',
    '@wm/oAuth': 'wm.oAuth',
    '@wm/runtime': 'wm.runtime',
    '@wm/security': 'wm.security',
    '@wm/variables': 'wm.variables',
    '@metrichor/jmespath': 'jmespath',
    'ngx-bootstrap': 'ngx-bootstrap',
    'ngx-bootstrap/pagination': 'pagination',
    'ngx-bootstrap/utils': 'utils',
    'ngx-bootstrap/positioning': 'positioning',
    'ngx-bootstrap/component-loader': 'componentLoader',
    'ngx-bootstrap/focus-trap': 'focusTrap',
    'ngx-bootstrap/mini-ngrx': 'miniNgrx',
    'ngx-bootstrap/collapse': 'collapse',
    'ngx-bootstrap/tooltip': 'tooltip',
    'ngx-bootstrap/timepicker': 'timepicker',
    'ngx-bootstrap/chronos': 'chronos',
    'ngx-bootstrap/typeahead': 'typeahead',
    'ngx-bootstrap/progressbar': 'progressbar',
    'ngx-bootstrap/datepicker': 'datepicker',
    'ngx-bootstrap/modal': 'modal',
    'ngx-bootstrap/dropdown': 'dropdown',
    'ngx-bootstrap/popover': 'popover',
    'ngx-bootstrap/carousel': 'carousel',
    'ngx-bootstrap/accordion': 'accordion',
    'ngx-bootstrap/buttons': 'buttons',
    'ngx-bootstrap/rating': 'rating',
    'ngx-bootstrap/locale': 'locale',
    'ngx-bootstrap/sortable': 'sortable',
    'ngx-bootstrap/tabs': 'tabs',
    'ng-circle-progress': 'ngCircleProgress',
    'ngx-color-picker': 'ngxColorpicker',
    'angular-imask': 'angularIMask',
    "imask": "IMask",
    "lodash-es": "_",
    'ngx-toastr': 'ngxToastr',
    'rxjs': 'rxjs',
    'rxjs/operators': 'rxjs.operators',
    'tslib': 'tslib',
    'angular2-websocket/angular2-websocket': 'angularWebSocket'
};

export const rollupExternals = [
    '@angular/core',
    '@angular/compiler',
    '@angular/router',
    '@angular/common/http',
    '@angular/platform-browser',
    '@angular/platform-browser-dynamic',
    '@angular/platform-browser/animations',
    '@angular/animations',
    '@angular/common',
    '@angular/forms',
    '@angular/core/primitives/signals',
    '@angular/core/primitives/event-dispatch',
    '@awesome-cordova-plugins/core/ngx',
    '@awesome-cordova-plugins/file/ngx',
    '@awesome-cordova-plugins/app-version/ngx',
    '@awesome-cordova-plugins/barcode-scanner/ngx',
    '@awesome-cordova-plugins/calendar/ngx',
    '@awesome-cordova-plugins/camera/ngx',
    '@awesome-cordova-plugins/file-opener/ngx',
    '@awesome-cordova-plugins/device/ngx',
    '@awesome-cordova-plugins/media-capture/ngx',
    '@awesome-cordova-plugins/geolocation/ngx',
    '@awesome-cordova-plugins/network/ngx',
    '@awesome-cordova-plugins/sqlite/ngx',
    '@awesome-cordova-plugins/vibration/ngx',
    '@awesome-cordova-plugins/location-accuracy/ngx',
    '@awesome-cordova-plugins/diagnostic/ngx',
    '@metrichor/jmespath',
    '@swipey',
    '@wm/http',
    '@wm/core',
    '@wm/oAuth',
    '@wm/transpiler',
    '@wm/variables',
    '@wm/security',
    '@wm/build-task',
    '@wm/components/basic',
    '@wm/components/basic/progress',
    '@wm/components/basic/rich-text-editor',
    '@wm/components/basic/search',
    '@wm/components/basic/tree',
    '@wm/components/dialogs',
    '@wm/components/dialogs/design-dialog',
    '@wm/components/base',
    '@wm/components/input',
    '@wm/components/input/calendar',
    '@wm/components/input/chips',
    '@wm/components/input/color-picker',
    '@wm/components/input/currency',
    '@wm/components/input/epoch',
    '@wm/components/input/file-upload',
    '@wm/components/input/rating',
    '@wm/components/input/slider',
    '@wm/mobile/core',
    '@wm/mobile/offline',
    '@wm/mobile/variables',
    '@wm/mobile/runtime',
    '@wm/mobile/runtime/dynamic',
    '@wm/mobile/placeholder/components',
    '@wm/mobile/placeholder/runtime',
    '@wm/mobile/components/basic',
    '@wm/mobile/components/basic/search',
    '@wm/mobile/components/containers/segmented-control',
    '@wm/mobile/components/data/media-list',
    '@wm/mobile/components/device/barcode-scanner',
    '@wm/mobile/components/device/camera',
    '@wm/mobile/components/input/file-upload',
    '@wm/mobile/components/page',
    '@wm/mobile/components/page/left-panel',
    '@wm/mobile/components/page/mobile-navbar',
    '@wm/mobile/components/page/tab-bar',
    '@wm/components/data/card',
    '@wm/components/data/form',
    '@wm/components/data/list',
    '@wm/components/data/live-table',
    '@wm/components/data/pagination',
    '@wm/components/data/table',
    '@wm/components/chart',
    '@wm/components/containers/accordion',
    '@wm/components/containers/linear-layout',
    '@wm/components/containers/layout-grid',
    '@wm/components/containers/panel',
    '@wm/components/containers/tabs',
    '@wm/components/containers/tile',
    '@wm/components/containers/wizard',
    '@wm/components/dialogs/alert-dialog',
    '@wm/components/dialogs/iframe-dialog',
    '@wm/components/dialogs/login-dialog',
    '@wm/components/dialogs/partial-dialog',
    '@wm/components/dialogs/confirm-dialog',
    '@wm/components/navigation/breadcrumb',
    '@wm/components/navigation/menu',
    '@wm/components/navigation/navbar',
    '@wm/components/navigation/popover',
    '@wm/components/advanced/carousel',
    '@wm/components/advanced/marquee',
    '@wm/components/advanced/login',
    '@wm/components/advanced/custom',
    '@wm/components/page',
    '@wm/components/page/footer',
    '@wm/components/page/header',
    '@wm/components/page/left-panel',
    '@wm/components/page/right-panel',
    '@wm/components/page/top-nav',
    '@wm/components/prefab',
    '@wavemaker/focus-trap',
    '@wavemaker/variables',
    '@wavemaker/custom-widgets-m3',
    '@wm/runtime/base',
    '@wm/runtime/dynamic',
    '@wm/components/base',
    'imask',
    'angular-imask',
    'angular2-websocket/angular2-websocket',
    'rxjs',
    'rxjs/operators',
    'lodash-es',
    'ngx-bootstrap/collapse',
    'ngx-bootstrap/utils',
    'ngx-bootstrap/positioning',
    'ngx-bootstrap/component-loader',
    'ngx-bootstrap/timepicker',
    'ngx-bootstrap/chronos',
    'ngx-bootstrap/focus-trap',
    'ngx-bootstrap/mini-ngrx',
    'ngx-bootstrap/typeahead',
    'ngx-bootstrap/progressbar',
    'ngx-bootstrap/pagination',
    'ngx-bootstrap/modal',
    'ngx-bootstrap/tooltip',
    'ngx-bootstrap/datepicker',
    'ngx-bootstrap/dropdown',
    'ngx-bootstrap/popover',
    'ngx-bootstrap/carousel',
    'ngx-bootstrap/accordion',
    'ngx-bootstrap/buttons',
    'ngx-bootstrap/rating',
    'ngx-bootstrap/locale',
    'ngx-bootstrap/sortable',
    'ngx-bootstrap/tabs',
    'ngx-color-picker',
    'ngx-toastr',
    'ng-circle-progress',
    'tslib'
]

export default rollupGlobals;
