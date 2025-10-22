import rollupGlobals, {rollupExternals} from './rollup-utils.mjs';

export default [
    {
        input: 'node_modules/ngx-bootstrap/collapse/fesm2022/ngx-bootstrap-collapse.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: 'node_modules/ngx-bootstrap/collapse/bundles/ngx-bootstrap-collapse.umd.js',
            format: 'umd',
            name: 'ngx-bootstrap/collapse',
            globals: rollupGlobals
        }
    },
    {
        input: './node_modules/ngx-bootstrap/chronos/fesm2022/ngx-bootstrap-chronos.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: 'node_modules/ngx-bootstrap/chronos/bundles/ngx-bootstrap-chronos.umd.js',
            format: 'umd',
            name: 'ngx-bootstrap/chronos',
            globals: rollupGlobals
        }
    },
    {
        input: 'node_modules/ngx-bootstrap/utils/fesm2022/ngx-bootstrap-utils.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: 'node_modules/ngx-bootstrap/utils/bundles/ngx-bootstrap-utils.umd.js',
            format: 'umd',
            name: 'ngx-bootstrap/utils',
            globals: rollupGlobals
        }
    },
    {
        input: 'node_modules/ngx-bootstrap/positioning/fesm2022/ngx-bootstrap-positioning.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: 'node_modules/ngx-bootstrap/positioning/bundles/ngx-bootstrap-positioning.umd.js',
            format: 'umd',
            name: 'ngx-bootstrap/positioning',
            globals: rollupGlobals
        }
    },
    {
        input: 'node_modules/ngx-bootstrap/component-loader/fesm2022/ngx-bootstrap-component-loader.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: 'node_modules/ngx-bootstrap/component-loader/bundles/ngx-bootstrap-component-loader.umd.js',
            format: 'umd',
            name: 'ngx-bootstrap/component-loader',
            globals: rollupGlobals
        }
    },
    {
        input: 'node_modules/ngx-bootstrap/dropdown/fesm2022/ngx-bootstrap-dropdown.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: 'node_modules/ngx-bootstrap/dropdown/bundles/ngx-bootstrap-dropdown.umd.js',
            format: 'umd',
            name: 'ngx-bootstrap/dropdown',
            globals: rollupGlobals
        }
    },
    {
        input: 'node_modules/ngx-bootstrap/locale/fesm2022/ngx-bootstrap-locale.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: 'node_modules/ngx-bootstrap/locale/bundles/ngx-bootstrap-locale.umd.js',
            format: 'umd',
            name: 'ngx-bootstrap/locale',
            globals: rollupGlobals
        }
    },
    {
        input: 'node_modules/ngx-bootstrap/buttons/fesm2022/ngx-bootstrap-buttons.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: 'node_modules/ngx-bootstrap/buttons/bundles/ngx-bootstrap-buttons.umd.js',
            format: 'umd',
            name: 'ngx-bootstrap/buttons',
            globals: rollupGlobals
        }
    },
    {
        input: 'node_modules/ngx-bootstrap/carousel/fesm2022/ngx-bootstrap-carousel.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: 'node_modules/ngx-bootstrap/carousel/bundles/ngx-bootstrap-carousel.umd.js',
            format: 'umd',
            name: 'ngx-bootstrap/carousel',
            globals: rollupGlobals
        }
    },
    {
        input: 'node_modules/ngx-bootstrap/mini-ngrx/fesm2022/ngx-bootstrap-mini-ngrx.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: 'node_modules/ngx-bootstrap/mini-ngrx/bundles/ngx-bootstrap-mini-ngrx.umd.js',
            format: 'umd',
            name: 'ngx-bootstrap/mini-ngrx',
            globals: rollupGlobals
        }
    },
    {
        input: 'node_modules/ngx-bootstrap/focus-trap/fesm2022/ngx-bootstrap-focus-trap.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: 'node_modules/ngx-bootstrap/focus-trap/bundles/ngx-bootstrap-focus-trap.umd.js',
            format: 'umd',
            name: 'ngx-bootstrap/focus-trap',
            globals: rollupGlobals
        }
    },
    {
        input: 'node_modules/ngx-bootstrap/modal/fesm2022/ngx-bootstrap-modal.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: 'node_modules/ngx-bootstrap/modal/bundles/ngx-bootstrap-modal.umd.js',
            format: 'umd',
            name: 'ngx-bootstrap/modal',
            globals: rollupGlobals
        }
    },
    {
        input: 'node_modules/ngx-bootstrap/pagination/fesm2022/ngx-bootstrap-pagination.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: 'node_modules/ngx-bootstrap/pagination/bundles/ngx-bootstrap-pagination.umd.js',
            format: 'umd',
            name: 'ngx-bootstrap/pagination',
            globals: rollupGlobals
        }
    },
    {
        input: 'node_modules/ngx-bootstrap/popover/fesm2022/ngx-bootstrap-popover.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: 'node_modules/ngx-bootstrap/popover/bundles/ngx-bootstrap-popover.umd.js',
            format: 'umd',
            name: 'ngx-bootstrap/popover',
            globals: rollupGlobals
        }
    },
    {
        input: 'node_modules/ngx-bootstrap/progressbar/fesm2022/ngx-bootstrap-progressbar.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: 'node_modules/ngx-bootstrap/progressbar/bundles/ngx-bootstrap-progressbar.umd.js',
            format: 'umd',
            name: 'ngx-bootstrap/progressbar',
            globals: rollupGlobals
        }
    },
    {
        input: 'node_modules/ngx-bootstrap/rating/fesm2022/ngx-bootstrap-rating.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: 'node_modules/ngx-bootstrap/rating/bundles/ngx-bootstrap-rating.umd.js',
            format: 'umd',
            name: 'ngx-bootstrap/rating',
            globals: rollupGlobals
        }
    },
    {
        input: 'node_modules/ngx-bootstrap/sortable/fesm2022/ngx-bootstrap-sortable.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: 'node_modules/ngx-bootstrap/sortable/bundles/ngx-bootstrap-sortable.umd.js',
            format: 'umd',
            name: 'ngx-bootstrap/sortable',
            globals: rollupGlobals
        }
    },
    {
        input: 'node_modules/ngx-bootstrap/tabs/fesm2022/ngx-bootstrap-tabs.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: 'node_modules/ngx-bootstrap/tabs/bundles/ngx-bootstrap-tabs.umd.js',
            format: 'umd',
            name: 'ngx-bootstrap/tabs',
            globals: rollupGlobals
        }
    },
    {
        input: 'node_modules/ngx-bootstrap/timepicker/fesm2022/ngx-bootstrap-timepicker.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: 'node_modules/ngx-bootstrap/timepicker/bundles/ngx-bootstrap-timepicker.umd.js',
            format: 'umd',
            name: 'ngx-bootstrap/timepicker',
            globals: rollupGlobals
        }
    },
    {
        input: 'node_modules/ngx-bootstrap/tooltip/fesm2022/ngx-bootstrap-tooltip.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: 'node_modules/ngx-bootstrap/tooltip/bundles/ngx-bootstrap-tooltip.umd.js',
            format: 'umd',
            name: 'ngx-bootstrap/tooltip',
            globals: rollupGlobals
        }
    },
    {
        input: 'node_modules/ngx-bootstrap/typeahead/fesm2022/ngx-bootstrap-typeahead.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: 'node_modules/ngx-bootstrap/typeahead/bundles/ngx-bootstrap-typeahead.umd.js',
            format: 'umd',
            name: 'ngx-bootstrap/typeahead',
            globals: rollupGlobals
        }
    },
    {
        input: 'node_modules/ngx-bootstrap/datepicker/fesm2022/ngx-bootstrap-datepicker.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: 'node_modules/ngx-bootstrap/datepicker/bundles/ngx-bootstrap-datepicker.umd.js',
            format: 'umd',
            name: 'ngx-bootstrap/datepicker',
            globals: rollupGlobals
        }
    },
    {
        input: 'node_modules/ngx-bootstrap/accordion/fesm2022/ngx-bootstrap-accordion.mjs',
        external: [ ...rollupExternals ],
        output: {
            file: 'node_modules/ngx-bootstrap/accordion/bundles/ngx-bootstrap-accordion.umd.js',
            format: 'umd',
            name: 'ngx-bootstrap/accordion',
            globals: rollupGlobals
        }
    }
]
