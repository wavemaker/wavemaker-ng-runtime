import { ImportDef } from './build';

const NG_FORM_MODULE: ImportDef[] = [{from: '@angular/forms', name: 'FormsModule', as: 'ngFormsModule'}];
const NG_REACTIVE_FORM_MODULE: ImportDef[] = [{from: '@angular/forms', name: 'ReactiveFormsModule', as: 'ngReactiveFormsModule'}];
const NGX_BS_DATE_PICKER: ImportDef[] = [{from: 'ngx-bootstrap/datepicker', name: 'BsDatepickerModule', as: 'ngx_BsDatepickerModule', forRoot: true}];
const NGX_CAROUSEL_MODULE: ImportDef[] = [{from: 'ngx-bootstrap/carousel', name: 'CarouselModule', as: 'ngxCarouselModule', forRoot: true}];
const NGX_COLOR_PICKER_MODULE: ImportDef[] = [{from: 'ngx-color-picker', name: 'ColorPickerModule', as: 'ngx_ColorPickerModule'}];
const NGX_DROP_DOWN_MODULE: ImportDef[] = [{from: 'ngx-bootstrap/dropdown', name: 'BsDropdownModule', as: 'ngxBsDropdownModule', forRoot: true}];
const NGX_DATE_PICKER: ImportDef[] = [{from: 'ngx-bootstrap/datepicker', name: 'DatepickerModule', as: 'ngx_DatepickerModule', forRoot: true}];
const NGX_MODAL_MODULE: ImportDef[] = [{from: 'ngx-bootstrap/modal', name: 'ModalModule', as: 'ngx_ModalModule', forRoot: true}];
const NGX_PAGINATION_MODULE: ImportDef[] = [{from: 'ngx-bootstrap/pagination', name: 'PaginationModule', as: 'ngxPaginationModule', forRoot: true}];
const NGX_POPOVER_MODULE: ImportDef[] = [{from: 'ngx-bootstrap/popover', name: 'PopoverModule', as: 'ngxPopoverModule', forRoot: true}];
const NGX_TIME_PICKER: ImportDef[] = [{from: 'ngx-bootstrap/timepicker', name: 'TimepickerModule', as: 'ngx_TimepickerModule', forRoot: true}];
const NGX_TOOL_TIP_MODULE: ImportDef[] = [{from: 'ngx-bootstrap/tooltip', name: 'TooltipModule', as: 'ngxTooltipModule', forRoot: true}];
const NGX_TYPE_HEAD_MODULE: ImportDef[] = [{from: 'ngx-bootstrap/typeahead', name: 'TypeaheadModule', as: 'ngxTypeaheadModule', forRoot: true}];


const MOBILE_BASIC_MODULE: ImportDef[] = [{from: '@wm/mobile/components/basic', name: 'BasicModule', as: 'WM_MobileBasicModule', platformType: 'MOBILE'}];
const MOBILE_EPOCH_MODULE: ImportDef[] = [{from: '@wm/mobile/components/input/epoch', name: 'EpochModule', as: 'WM_MobileEpochModule',  platformType: 'MOBILE'}];
const MOBILE_FILE_UPLOAD_MODULE: ImportDef[] = [{from: '@wm/mobile/components/input/file-upload', name: 'FileUploadModule', as: 'WM_MobileFileUploadModule', platformType: 'MOBILE'}];
const PAGE_MODULE: ImportDef[] = [{from: '@wm/components/page', name: 'PageModule'},
    {from: '@wm/mobile/components/page', name: 'PageModule', as: 'WM_MobilePageModule', platformType: 'MOBILE'}];
const BASIC_MODULE: ImportDef[] = [{from: '@wm/components/basic', name: 'BasicModule'}, ...MOBILE_BASIC_MODULE];
const INPUT_MODULE: ImportDef[] = [...NG_FORM_MODULE, {from: '@wm/components/input', name: 'InputModule'}];
const DIALOG_MODULE: ImportDef[] = [...NGX_MODAL_MODULE, ...INPUT_MODULE, {from: '@wm/components/dialogs', name: 'DialogModule'}];
const NAV_MODULE: ImportDef[] = [...BASIC_MODULE, {from: '@wm/components/navigation/nav', name: 'NavModule'}];
const PAGINATION_MODULE: ImportDef[] = [...NG_FORM_MODULE, ...NGX_PAGINATION_MODULE, {from: '@wm/components/data/pagination', name: 'PaginationModule'}];
const SEARCH_MODULE: ImportDef[] = [...NG_FORM_MODULE, ...NGX_TYPE_HEAD_MODULE, {from: '@wm/components/basic/search', name: 'SearchModule'}];

const ACCORDION_MODULE: ImportDef[] = [{from: '@wm/components/containers/accordion', name: 'AccordionModule'}];
const ALERT_DIALOG_MODULE: ImportDef[] = [...DIALOG_MODULE, {from: '@wm/components/dialogs/alert-dialog', name: 'AlertDialogModule'}];
const BARCODE_SCANNER_MODULE: ImportDef[] = [...NAV_MODULE, {from: '@wm/mobile/components/device/barcode-scanner', name: 'BarcodeScannerModule'}];
const BREAD_CRUMB_MODULE: ImportDef[] = [{from: '@wm/components/navigation/breadcrumb', name: 'BreadcrumbModule'}];
const CAMERA_MODULE: ImportDef[] = [{from: '@wm/mobile/components/device/camera', name: 'CameraModule'}];
const CALENDAR_MODULE: ImportDef[] = [...NG_FORM_MODULE, ...NGX_DATE_PICKER, {from: '@wm/components/input/calendar', name: 'CalendarModule'}];
const CARD_MODULE: ImportDef[] = [...NGX_DROP_DOWN_MODULE, {from: '@wm/components/data/card', name: 'CardModule'}];
const CAROUSEL_MODULE: ImportDef[] = [...NGX_CAROUSEL_MODULE, {from: '@wm/components/advanced/carousel', name: 'CarouselModule'}];
const CHART_MODULE: ImportDef[] = [{from: '@wm/components/chart', name: 'ChartModule'}];
const CHIPS_MODULE: ImportDef[] = [...SEARCH_MODULE, {from: '@wm/components/input/chips', name: 'ChipsModule'}];
const COLOR_PICKER_MODULE: ImportDef[] = [...NG_FORM_MODULE, ...NGX_COLOR_PICKER_MODULE, {from: '@wm/components/input/color-picker', name: 'ColorPickerModule'}];
const CONFIRM_DIALOG_MODULE: ImportDef[] = [...DIALOG_MODULE, {from: '@wm/components/dialogs/confirm-dialog', name: 'ConfirmDialogModule'}];
const CONTENT_MODULE: ImportDef[] = [{from: '@wm/components/page', name: 'PageModule'}];
const CURRENCY_MODULE: ImportDef[] = [...INPUT_MODULE, {from: '@wm/components/input/currency', name: 'CurrencyModule'}];
const DESIGN_DIALOG_MODULE: ImportDef[] = [...DIALOG_MODULE, {from: '@wm/components/dialogs/design-dialog', name: 'DesignDialogModule'}];
const EPOCH_MODULE: ImportDef[] = [...NG_FORM_MODULE, ...NGX_BS_DATE_PICKER, ...NGX_TIME_PICKER, ...NGX_DROP_DOWN_MODULE, ...NGX_DATE_PICKER, ...MOBILE_EPOCH_MODULE, {from: '@wm/components/input/epoch', name: 'EpochModule'}];
const FILE_UPLOAD_MODULE: ImportDef[] = [...MOBILE_FILE_UPLOAD_MODULE, {from: '@wm/components/input/file-upload', name: 'FileUploadModule'}];
const FOOTER_MODULE: ImportDef[] = [{from: '@wm/components/page/footer', name: 'FooterModule'}];
const HEADER_MODULE: ImportDef[] = [{from: '@wm/components/page/header', name: 'HeaderModule'}];
const IFRAME_DIALOG_MODULE: ImportDef[] = [...DIALOG_MODULE, {from: '@wm/components/dialogs/iframe-dialog', name: 'IframeDialogModule'}];
const LAYOUT_GRID_MODULE: ImportDef[] = [{from: '@wm/components/containers/layout-grid', name: 'LayoutGridModule'}];
const LOGIN_DIALOG_MODULE: ImportDef[] = [...DIALOG_MODULE, {from: '@wm/components/dialogs/login-dialog', name: 'LoginDialogModule'}];
const MENU_MODULE: ImportDef[] = [...NAV_MODULE, ...NGX_DROP_DOWN_MODULE, {from: '@wm/components/navigation/menu', name: 'MenuModule'}];
const MARQUEE_MODULE: ImportDef[] = [{from: '@wm/components/advanced/marquee', name: 'MarqueeModule'}];
const LEFT_PANEL_MODULE: ImportDef[] = [{from: '@wm/components/page/left-panel', name: 'LeftPanelModule'},
    {from: '@wm/mobile/components/page/left-panel', name: 'LeftPanelModule', as: 'WM_MobileLeftPanelModule', platformType: 'MOBILE'}];
const LIST_MODULE: ImportDef[] = [...PAGINATION_MODULE, ...INPUT_MODULE, {from: '@wm/components/data/list', name: 'ListModule'}];
const LOGIN_MODULE: ImportDef[] = [{from: '@wm/components/advanced/login', name: 'LoginModule'}];
const MOBILE_NAV_BAR_MODULE: ImportDef[] = [...LEFT_PANEL_MODULE, ...SEARCH_MODULE, ...PAGE_MODULE, {from: '@wm/mobile/components/page/mobile-navbar', name: 'MobileNavbarModule'}];
const MEDIA_LIST_MODULE: ImportDef[] = [...BASIC_MODULE, ...PAGE_MODULE, ...MOBILE_NAV_BAR_MODULE, {from: '@wm/mobile/components/data/media-list', name: 'MediaListModule'}];
const MOBILE_TAB_BAR_MODULE: ImportDef[] = [{from: '@wm/mobile/components/page/tab-bar', name: 'TabBarModule'}];
const NAVBAR_MODULE: ImportDef[] = [{from: '@wm/components/navigation/navbar', name: 'NavbarModule'}];
const POPOVER_MODULE: ImportDef[] = [...NGX_POPOVER_MODULE, {from: '@wm/components/navigation/popover', name: 'PopoverModule'}];
const PANEL_MODULE: ImportDef[] = [{from: '@wm/components/containers/panel', name: 'PanelModule'}];
const PARTIAL_DIALOG_MODULE: ImportDef[] = [...DIALOG_MODULE, {from: '@wm/components/dialogs/partial-dialog', name: 'PartialDialogModule'}];
const PROGRESS_MODULE: ImportDef[] = [{from: '@wm/components/basic/progress', name: 'ProgressModule'}];
const PREFAB_MODULE: ImportDef[] = [{from: '@wm/components/prefab', name: 'PrefabModule'}];
const RATING_MODULE: ImportDef[] = [{from: '@wm/components/input/rating', name: 'RatingModule'}];
const RICH_TEXT_EDITOR_MODULE: ImportDef[] = [{from: '@wm/components/basic/rich-text-editor', name: 'RichTextEditorModule'}];
const RIGHT_PANEL_MODULE: ImportDef[] = [{from: '@wm/components/page/right-panel', name: 'RightPanelModule'}];
const SEGMENTED_CONTROL_MODULE: ImportDef[] = [{from: '@wm/mobile/components/containers/segmented-control', name: 'SegmentedControlModule'}];
const SLIDER_MODULE: ImportDef[] = [...NG_FORM_MODULE, {from: '@wm/components/input/slider', name: 'SliderModule'}];
const TABS_MODULE: ImportDef[] = [{from: '@wm/components/containers/tabs', name: 'TabsModule'}];
const TABLE_MODULE: ImportDef[] = [...PAGINATION_MODULE, ...NGX_TOOL_TIP_MODULE, ...LIST_MODULE, {from: '@wm/components/data/table', name: 'TableModule'}];
const TILE_MODULE: ImportDef[] = [{from: '@wm/components/containers/tile', name: 'TileModule'}];
const TOP_NAV_MODULE: ImportDef[] = [{from: '@wm/components/page/top-nav', name: 'TopNavModule'}];
const TREE_MODULE: ImportDef[] = [{from: '@wm/components/basic/tree', name: 'TreeModule'}];
const WIZARD_MODULE: ImportDef[] = [...NG_FORM_MODULE, {from: '@wm/components/containers/wizard', name: 'WizardModule'}];


const LIVE_TABLE_MODULE: ImportDef[] = [...TABLE_MODULE, {from: '@wm/components/data/live-table', name: 'LiveTableModule'}];
const FORM_MODULE: ImportDef[] = [...NG_FORM_MODULE, ...NG_REACTIVE_FORM_MODULE, ...INPUT_MODULE, ...PAGE_MODULE, ...DESIGN_DIALOG_MODULE, {from: '@wm/components/data/form', name: 'FormModule'}];

export const WIDGET_IMPORTS: Map<string, ImportDef[]> = new Map([
    ['wm-accordion', ACCORDION_MODULE],
    ['wm-accordionpane', ACCORDION_MODULE],
    ['wm-anchor', BASIC_MODULE],
    ['wm-alertdialog', ALERT_DIALOG_MODULE],
    ['wm-audio', BASIC_MODULE],
    ['wm-barcodescanner', BARCODE_SCANNER_MODULE],
    ['wm-button', INPUT_MODULE],
    ['wm-buttongroup', INPUT_MODULE],
    ['wm-breadcrumb', BREAD_CRUMB_MODULE],
    ['wm-camera', CAMERA_MODULE],
    ['wm-calendar', CALENDAR_MODULE],
    ['wm-card', CARD_MODULE],
    ['wm-card-actions', CARD_MODULE],
    ['wm-card-content', CARD_MODULE],
    ['wm-card-footer', CARD_MODULE],
    ['wm-carousel', CAROUSEL_MODULE],
    ['wm-carousel-content', CAROUSEL_MODULE],
    ['wm-carousel-template', CAROUSEL_MODULE],
    ['wm-chart', CHART_MODULE],
    ['wm-checkbox', INPUT_MODULE],
    ['wm-checkboxset', INPUT_MODULE],
    ['wm-chips', CHIPS_MODULE],
    ['wm-colorpicker', COLOR_PICKER_MODULE],
    ['wm-confirmdialog', CONFIRM_DIALOG_MODULE],
    ['wm-content', CONTENT_MODULE],
    ['wm-currency', CURRENCY_MODULE],
    ['wm-date', EPOCH_MODULE],
    ['wm-datetime', EPOCH_MODULE],
    ['wm-dialog', DESIGN_DIALOG_MODULE],
    ['wm-footer', FOOTER_MODULE],
    ['wm-form', FORM_MODULE],
    ['wm-form-action', FORM_MODULE],
    ['wm-form-field', FORM_MODULE],
    ['wm-filter-field', FORM_MODULE],
    ['wm-fileupload', FILE_UPLOAD_MODULE],
    ['wm-gridrow', LAYOUT_GRID_MODULE],
    ['wm-gridcolumn', LAYOUT_GRID_MODULE],
    ['wm-header', HEADER_MODULE],
    ['wm-html', BASIC_MODULE],
    ['wm-icon', BASIC_MODULE],
    ['wm-iframe', BASIC_MODULE],
    ['wm-iframedialog', IFRAME_DIALOG_MODULE],
    ['wm-label', BASIC_MODULE],
    ['wm-layoutgrid', LAYOUT_GRID_MODULE],
    ['wm-left-panel', LEFT_PANEL_MODULE],
    ['wm-list', LIST_MODULE],
    ['wm-livetable', LIVE_TABLE_MODULE],
    ['wm-login', LOGIN_MODULE],
    ['wm-logindialog', LOGIN_DIALOG_MODULE],
    ['wm-marquee', MARQUEE_MODULE],
    ['wm-menu', MENU_MODULE],
    ['wm-media-list',  MEDIA_LIST_MODULE],
    ['wm-mobile-navbar', MOBILE_NAV_BAR_MODULE],
    ['wm-mobile-tabbar', MOBILE_TAB_BAR_MODULE],
    ['wm-nav', NAV_MODULE],
    ['wm-navbar', NAVBAR_MODULE],
    ['wm-nav-item', NAV_MODULE],
    ['wm-network-info-toaster', BASIC_MODULE],
    ['wm-number', INPUT_MODULE],
    ['wm-page', PAGE_MODULE],
    ['wm-page-content', PAGE_MODULE],
    ['wm-pagedialog', PARTIAL_DIALOG_MODULE],
    ['wm-pagination', PAGINATION_MODULE],
    ['wm-panel', PANEL_MODULE],
    ['wm-panel-footer', PANEL_MODULE],
    ['wm-picture', BASIC_MODULE],
    ['wm-popover', POPOVER_MODULE],
    ['wm-progress-bar', PROGRESS_MODULE],
    ['wm-prefab', PREFAB_MODULE],
    ['wm-prefab-container', PREFAB_MODULE],
    ['wm-progress-circle', PROGRESS_MODULE],
    ['wm-radioset', INPUT_MODULE],
    ['wm-rating', RATING_MODULE],
    ['wm-richtexteditor', RICH_TEXT_EDITOR_MODULE],
    ['wm-right-panel', RIGHT_PANEL_MODULE],
    ['wm-select', INPUT_MODULE],
    ['wm-search', SEARCH_MODULE],
    ['wm-segmented-content', SEGMENTED_CONTROL_MODULE],
    ['wm-segmented-control', SEGMENTED_CONTROL_MODULE],
    ['wm-slider', SLIDER_MODULE],
    ['wm-spinner', BASIC_MODULE],
    ['wm-switch', INPUT_MODULE],
    ['wm-table', TABLE_MODULE],
    ['wm-tabs', TABS_MODULE],
    ['wm-tabpane', TABS_MODULE],
    ['wm-text', INPUT_MODULE],
    ['wm-textarea', INPUT_MODULE],
    ['wm-time', EPOCH_MODULE],
    ['wm-tile', TILE_MODULE],
    ['wm-top-nav', TOP_NAV_MODULE],
    ['wm-tree', TREE_MODULE],
    ['wm-video', BASIC_MODULE],
    ['wm-wizard', WIZARD_MODULE],
    ['wm-wizardstep', WIZARD_MODULE],
]);


