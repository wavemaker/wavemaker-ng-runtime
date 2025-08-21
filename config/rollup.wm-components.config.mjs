import rollupGlobals, {rollupExternals} from './rollup-utils.mjs';

export default [
    {
        input: './libraries/core/fesm2022/index.mjs',
        type: 'module',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/core/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.core',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/swipey/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/swipey/bundles/index.umd.js',
            format: 'umd',
            name: 'swipey',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/transpiler/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/transpiler/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.transpiler',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/http/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/http/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.http',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/oAuth/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/oAuth/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.oAuth',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/security/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/security/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.security',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/components/base/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/components/base/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.components.base',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/build-task/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/build-task/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.buildTask',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/components/input/default/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/components/input/default/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.components.input',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/components/basic/default/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/components/basic/default/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.components.basic',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/components/basic/progress/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/components/basic/progress/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.components.basic.progress',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/components/basic/rich-text-editor/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/components/basic/rich-text-editor/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.components.basic.richtexteditor',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/components/basic/search/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/components/basic/search/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.components.basic.search',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/components/basic/tree/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/components/basic/tree/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.components.basic.tree',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/components/input/calendar/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/components/input/calendar/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.components.input.calendar',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/components/input/chips/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/components/input/chips/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.components.input.chips',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/components/input/color-picker/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/components/input/color-picker/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.components.input.colorpicker',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/components/input/currency/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/components/input/currency/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.components.input.currency',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/components/input/epoch/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/components/input/epoch/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.components.input.epoch',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/components/input/file-upload/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/components/input/file-upload/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.components.input.fileupload',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/components/input/rating/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/components/input/rating/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.components.input.rating',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/components/input/slider/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/components/input/slider/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.components.input.slider',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/components/chart/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/components/chart/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.components.chart',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/components/navigation/menu/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/components/navigation/menu/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.components.navigation.menu',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/components/navigation/navbar/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/components/navigation/navbar/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.components.navigation.navbar',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/components/navigation/breadcrumb/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/components/navigation/breadcrumb/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.components.navigation.breadcrumb',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/components/navigation/popover/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/components/navigation/popover/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.components.navigation.popover',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/components/dialogs/default/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/components/dialogs/default/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.components.dialogs',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/components/dialogs/alert-dialog/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/components/dialogs/alert-dialog/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.components.dialogs.alertdialog',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/components/dialogs/confirm-dialog/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/components/dialogs/confirm-dialog/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.components.dialogs.confirmdialog',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/components/dialogs/design-dialog/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/components/dialogs/design-dialog/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.components.dialogs.designdialog',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/components/page/default/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/components/page/default/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.components.page',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/components/page/footer/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/components/page/footer/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.components.page.footer',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/components/page/header/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/components/page/header/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.components.page.header',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/components/page/left-panel/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/components/page/left-panel/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.components.page.leftpanel',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/components/page/right-panel/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/components/page/right-panel/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.components.page.rightpanel',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/components/page/top-nav/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/components/page/top-nav/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.components.page.topnav',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/components/prefab/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/components/prefab/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.components.prefab',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/components/data/pagination/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/components/data/pagination/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.components.data.pagination',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/components/data/card/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/components/data/card/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.components.data.card',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/components/data/list/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/components/data/list/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.components.data.list',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/components/data/table/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/components/data/table/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.components.data.table',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/components/data/live-table/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/components/data/live-table/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.components.data.livetable',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/components/data/form/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/components/data/form/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.components.data.form',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/components/dialogs/iframe-dialog/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/components/dialogs/iframe-dialog/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.components.dialogs.iframedialog',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/components/dialogs/login-dialog/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/components/dialogs/login-dialog/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.components.dialogs.logindialog',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/components/dialogs/partial-dialog/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/components/dialogs/partial-dialog/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.components.dialogs.partialdialog',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/components/containers/accordion/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/components/containers/accordion/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.components.containers.accordion',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/components/containers/layout-grid/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/components/containers/layout-grid/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.components.containers.layoutgrid',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/components/containers/linear-layout/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/components/containers/linear-layout/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.components.containers.linearlayout',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/components/containers/panel/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/components/containers/panel/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.components.containers.panel',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/components/containers/tabs/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/components/containers/tabs/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.components.containers.tabs',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/components/containers/wizard/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/components/containers/wizard/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.components.containers.wizard',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/components/containers/tile/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/components/containers/tile/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.components.containers.tile',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/components/advanced/carousel/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/components/advanced/carousel/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.components.advanced.carousel',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/components/advanced/marquee/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/components/advanced/marquee/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.components.advanced.marquee',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/components/advanced/login/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/components/advanced/login/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.components.advanced.login',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/components/advanced/custom/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/components/advanced/custom/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.components.advanced.custom',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/variables/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/variables/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.variables',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/runtime/base/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/runtime/base/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.runtime.base',
            globals: rollupGlobals
        }
    },
    {
        input: './libraries/runtime/dynamic/fesm2022/index.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: './libraries/runtime/dynamic/bundles/index.umd.js',
            format: 'umd',
            name: 'wm.runtime.dynamic',
            globals: rollupGlobals
        }
    }
]
