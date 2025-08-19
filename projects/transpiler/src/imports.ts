import { ImportDef } from './build';

// Angular Core Modules
const NG_FORM_MODULE: ImportDef[] = [{ from: '@angular/forms', name: 'FormsModule', as: 'ngFormsModule' }];
const NG_REACTIVE_FORM_MODULE: ImportDef[] = [{ from: '@angular/forms', name: 'ReactiveFormsModule', as: 'ngReactiveFormsModule' }];

// NGX Bootstrap Modules
const NGX_BS_DATE_PICKER: ImportDef[] = [{ from: 'ngx-bootstrap/datepicker', name: 'BsDatepickerModule', as: 'ngx_BsDatepickerModule' }];
const NGX_CAROUSEL_MODULE: ImportDef[] = [{ from: 'ngx-bootstrap/carousel', name: 'CarouselModule', as: 'ngxCarouselModule', forRoot: true }];
const NGX_COLOR_PICKER_DIRECTIVE: ImportDef[] = [{ from: 'ngx-color-picker', name: 'ColorPickerDirective', as: 'ngx_ColorPickerDirective' }];
const NGX_DROP_DOWN_MODULE: ImportDef[] = [{ from: 'ngx-bootstrap/dropdown', name: 'BsDropdownModule', as: 'ngxBsDropdownModule', forRoot: true }];
//const NGX_MODAL_MODULE: ImportDef[] = [{ from: 'ngx-bootstrap/modal', name: 'ModalModule', as: 'ngx_ModalModule' }];
const NGX_PAGINATION_MODULE: ImportDef[] = [{ from: 'ngx-bootstrap/pagination', name: 'PaginationModule', as: 'ngxPaginationModule', forRoot: true }];
const NGX_POPOVER_MODULE: ImportDef[] = [{ from: 'ngx-bootstrap/popover', name: 'PopoverModule', as: 'ngxPopoverModule', forRoot: true }];
const NGX_TIME_PICKER: ImportDef[] = [{ from: 'ngx-bootstrap/timepicker', name: 'TimepickerModule', as: 'ngx_TimepickerModule', forRoot: true }];
const NGX_TOOL_TIP_MODULE: ImportDef[] = [{ from: 'ngx-bootstrap/tooltip', name: 'TooltipModule', as: 'ngxTooltipModule', forRoot: true }];
const NGX_TYPE_HEAD_MODULE: ImportDef[] = [{ from: 'ngx-bootstrap/typeahead', name: 'TypeaheadModule', as: 'ngxTypeaheadModule', forRoot: true }];

// Progess Modules
const PROGRESS_BAR_COMPONENT: ImportDef[] = [{ from: '@wm/components/basic/progress/progress-bar', name: 'ProgressBarComponent' }];
const PROGRESS_CIRCLE_COMPONENT: ImportDef[] = [{ from: '@wm/components/basic/progress/progress-circle', name: 'ProgressCircleComponent' }];
const PAGE_COMPONENT: ImportDef[] = [{ from: '@wm/components/page', name: 'PageDirective' }];
const PAGINATION_COMPONENT: ImportDef[] = [...NG_FORM_MODULE, ...NGX_PAGINATION_MODULE, { from: '@wm/components/data/pagination', name: 'PaginationComponent' }];

// Basic Components
const ANCHOR_COMPONENT: ImportDef[] = [{ from: '@wm/components/basic/anchor', name: 'AnchorComponent' }];
const AUDIO_COMPONENT: ImportDef[] = [{ from: '@wm/components/basic/audio', name: 'AudioComponent' }];
const HTML_COMPONENT: ImportDef[] = [{ from: '@wm/components/basic/html', name: 'HtmlDirective' }];
const ICON_COMPONENT: ImportDef[] = [{ from: '@wm/components/basic/icon', name: 'IconComponent' }];
const IFRAME_COMPONENT: ImportDef[] = [{ from: '@wm/components/basic/iframe', name: 'IframeComponent' }];
const LABEL_COMPONENT: ImportDef[] = [{ from: '@wm/components/basic/label', name: 'LabelDirective' }];
const PICTURE_COMPONENT: ImportDef[] = [{ from: '@wm/components/basic/picture', name: 'PictureDirective' }];
const SEARCH_COMPONENT: ImportDef[] = [
    ...NG_FORM_MODULE,
    ...NGX_TYPE_HEAD_MODULE,
    { from: '@wm/components/basic/search', name: 'ScrollableDirective' },
    { from: '@wm/components/basic/search', name: 'SearchComponent' }];
const SPINNER_COMPONENT: ImportDef[] = [{ from: '@wm/components/basic/spinner', name: 'SpinnerComponent' }];
const VIDEO_COMPONENT: ImportDef[] = [{ from: '@wm/components/basic/video', name: 'VideoComponent' }];

// Container Components
const PARTIAL_DIRECTIVE: ImportDef[] = [{ from: '@wm/components/base', name: 'PartialDirective' }];
const PARTIAL_CONTAINER: ImportDef[] = [{ from: '@wm/components/base', name: 'PartialParamHandlerDirective' }, { from: '@wm/components/base', name: 'PartialContainerDirective' }]
const ACCORDION_PANE_COMPONENT: ImportDef[] = [...PARTIAL_CONTAINER, { from: '@wm/components/containers/accordion', name: 'AccordionPaneComponent' }];
const ACCORDION_DIRECTIVE: ImportDef[] = [{ from: '@wm/components/containers/accordion', name: 'AccordionDirective' }];
const CONTAINER_DIRECTIVE: ImportDef[] = [...PARTIAL_CONTAINER, { from: '@wm/components/base', name: 'ContainerDirective' }]
const PARTIAL_PARAM_DIRECTIVE: ImportDef[] = [{ from: '@wm/components/base', name: 'PartialParamDirective' }];
const LINEAR_LAYOUT_ITEM_DIRECTIVE: ImportDef[] = [{ from: '@wm/components/containers/linear-layout', name: 'LinearLayoutItemDirective' }];
const LINEAR_LAYOUT_DIRECTIVE: ImportDef[] = [...LINEAR_LAYOUT_ITEM_DIRECTIVE, { from: '@wm/components/containers/linear-layout', name: 'LinearLayoutDirective' }];
const TAB_PANE_COMPONENT: ImportDef[] = [...PARTIAL_CONTAINER, { from: '@wm/components/containers/tabs', name: 'TabPaneComponent' }];
const TABS_COMPONENT: ImportDef[] = [...TAB_PANE_COMPONENT, { from: '@wm/components/containers/tabs', name: 'TabsComponent' }];
const WIZARD_ACTION_DIRECTIVE: ImportDef[] = [{ from: '@wm/components/containers/wizard', name: 'WizardActionDirective' }];
const WIZARD_STEP_DIRECTIVE: ImportDef[] = [...PARTIAL_CONTAINER, { from: '@wm/components/containers/wizard', name: 'WizardStepComponent' }];
const WIZARD_COMPONENT: ImportDef[] = [...NG_FORM_MODULE, ...WIZARD_ACTION_DIRECTIVE, ...WIZARD_STEP_DIRECTIVE, { from: '@wm/components/containers/wizard', name: 'WizardComponent' }];
const LAYOUT_GRID_COLUMN_DIRECTIVE: ImportDef[] = [{ from: '@wm/components/containers/layout-grid', name: 'LayoutGridColumnDirective' }];
const LAYOUT_GRID_ROW_DIRECTIVE: ImportDef[] = [{ from: '@wm/components/containers/layout-grid', name: 'LayoutGridRowDirective' }];
const LAYOUT_GRID_DIRECTIVE: ImportDef[] = [...LAYOUT_GRID_ROW_DIRECTIVE, ...LAYOUT_GRID_COLUMN_DIRECTIVE, { from: '@wm/components/containers/layout-grid', name: 'LayoutgridDirective' }];
const PANEL_COMPONENT: ImportDef[] = [...PARTIAL_CONTAINER, { from: '@wm/components/containers/panel', name: 'PanelComponent' }];
const TILE_DIRECTIVE: ImportDef[] = [{ from: '@wm/components/containers/tile', name: 'TileDirective' }];

// Dialog Modules
const ALERT_DIALOG_COMPONENT: ImportDef[] = [{ from: '@wm/components/dialogs/alert-dialog', name: 'AlertDialogComponent' }];
const CONFIRM_DIALOG_COMPONENT: ImportDef[] = [{ from: '@wm/components/dialogs/confirm-dialog', name: 'ConfirmDialogComponent' }];
const DESIGN_DIALOG_COMPONENT: ImportDef[] = [{ from: '@wm/components/dialogs/design-dialog', name: 'DialogComponent' }];
const IFRAME_DIALOG_COMPONENT: ImportDef[] = [{ from: '@wm/components/dialogs/iframe-dialog', name: 'IframeDialogComponent' }];
const LOGIN_DIALOG_DIRECTIVE: ImportDef[] = [{ from: '@wm/components/dialogs/login-dialog', name: 'LoginDialogDirective' }, ...DESIGN_DIALOG_COMPONENT];
const PARTIAL_DIALOG_COMPONENT: ImportDef[] = [{ from: '@wm/components/dialogs/partial-dialog', name: 'PartialDialogComponent' }, ...CONTAINER_DIRECTIVE];
const DIALOGACTIONS_DIRECTIVE: ImportDef[] = [{ from: '@wm/components/dialogs', name: 'DialogFooterDirective' }];

// Navigation Modules
const NAV_ITEM_DIRECTIVE: ImportDef[] = [{ from: '@wm/components/navigation/menu', name: 'NavItemDirective' }];
const NAV_COMPONENT: ImportDef[] = [{ from: '@wm/components/navigation/menu', name: 'NavComponent' }];
const NAVIGATION_CONTROL_DIRECTIVE: ImportDef[] = [{ from: '@wm/components/navigation/menu', name: 'NavigationControlDirective' }];
const MENU_DROPDOWN_ITEM_COMPONENT: ImportDef[] = [{ from: '@wm/components/navigation/menu', name: 'MenuDropdownComponent' }];
const MENU_DROPDOWN_COMPONENT: ImportDef[] = [{ from: '@wm/components/navigation/menu', name: 'MenuDropdownComponent' }]; // Duplicate, consider removing one
const MENU_COMPONENT: ImportDef[] = [...NGX_DROP_DOWN_MODULE, ...MENU_DROPDOWN_COMPONENT, ...MENU_DROPDOWN_ITEM_COMPONENT, ...NAVIGATION_CONTROL_DIRECTIVE, ...NAV_COMPONENT, ...NAV_ITEM_DIRECTIVE, { from: '@wm/components/navigation/menu', name: 'MenuComponent' }];
const MESSAGE_COMPONENT: ImportDef[] = [{ from: '@wm/components/base', name: 'MessageComponent' }];
const BREAD_CRUMB_COMPONENT: ImportDef[] = [...MENU_COMPONENT, { from: '@wm/components/navigation/breadcrumb', name: 'BreadcrumbComponent' }];
const NAVBAR_COMPONENT: ImportDef[] = [{ from: '@wm/components/navigation/navbar', name: 'NavbarComponent' }];
const POPOVER_COMPONENT: ImportDef[] = [...NGX_POPOVER_MODULE, { from: '@wm/components/navigation/popover', name: 'PopoverComponent' }, ...CONTAINER_DIRECTIVE];
const TOP_NAV_DIRECTIVE: ImportDef[] = [...PARTIAL_CONTAINER, { from: '@wm/components/page/top-nav', name: 'TopNavDirective' }];

// Input Components
const CALENDAR_COMPONENT: ImportDef[] = [...NG_FORM_MODULE, ...NGX_BS_DATE_PICKER, { from: '@wm/components/input/calendar', name: 'CalendarComponent' }];
const CHIPS_COMPONENT: ImportDef[] = [...SEARCH_COMPONENT, { from: '@wm/components/input/chips', name: 'ChipsComponent' }];
const COLOR_PICKER_COMPONENT: ImportDef[] = [...NG_FORM_MODULE, ...NGX_COLOR_PICKER_DIRECTIVE, { from: '@wm/components/input/color-picker', name: 'ColorPickerComponent' }];
const CURRENCY_COMPONENT: ImportDef[] = [{ from: '@wm/components/input/currency', name: 'CurrencyComponent' }];
const DATE_COMPONENT: ImportDef[] = [
    ...NG_FORM_MODULE, ...NGX_BS_DATE_PICKER, ...NGX_DROP_DOWN_MODULE,
    { from: '@wm/components/input/epoch/date', name: 'DateComponent' }];
const DATE_TIME_COMPONENT: ImportDef[] = [
    ...NG_FORM_MODULE, ...NGX_BS_DATE_PICKER, ...NGX_TIME_PICKER, ...NGX_DROP_DOWN_MODULE,
    { from: '@wm/components/input/epoch/date-time', name: 'DatetimeComponent' }];
const TIME_COMPONENT: ImportDef[] = [
    ...NG_FORM_MODULE, ...NGX_BS_DATE_PICKER, ...NGX_TIME_PICKER, ...NGX_DROP_DOWN_MODULE,
    { from: '@wm/components/input/epoch/time', name: 'TimeComponent' }];
const FILE_UPLOAD_COMPONENT: ImportDef[] = [{ from: '@wm/components/input/file-upload', name: 'FileUploadComponent' }];
const RATING_COMPONENT: ImportDef[] = [{ from: '@wm/components/input/rating', name: 'RatingComponent' }];
const SLIDER_COMPONENT: ImportDef[] = [...NG_FORM_MODULE, { from: '@wm/components/input/slider', name: 'SliderComponent' }];
const BUTTON_COMPONENT: ImportDef[] = [...NG_FORM_MODULE, { from: '@wm/components/input/button', name: 'ButtonComponent' }];
const BUTTON_GROUP_DIRECTIVE: ImportDef[] = [...NG_FORM_MODULE, { from: '@wm/components/input/button-group', name: 'ButtonGroupDirective' }];
// const CAPTION_POSITION_DIRECTIVE: ImportDef[] = [...NG_FORM_MODULE, { from: '@wm/components/input', name: 'CaptionPositionDirective' }];
const CHECKBOX_COMPONENT: ImportDef[] = [...NG_FORM_MODULE, { from: '@wm/components/input/checkbox', name: 'CheckboxComponent' }];
const CHECKBOXSET_COMPONENT: ImportDef[] = [...NG_FORM_MODULE, { from: '@wm/components/input/checkboxset', name: 'CheckboxsetComponent' }];
// const COMPOSITE_DIRECTIVE: ImportDef[] = [...NG_FORM_MODULE, { from: '@wm/components/input', name: 'CompositeDirective' }];
const NUMBER_COMPONENT: ImportDef[] = [...NG_FORM_MODULE, { from: '@wm/components/input/number', name: 'NumberComponent' }];
const RADIOSET_COMPONENT: ImportDef[] = [...NG_FORM_MODULE, { from: '@wm/components/input/radioset', name: 'RadiosetComponent' }];
const SELECT_COMPONENT: ImportDef[] = [...NG_FORM_MODULE, { from: '@wm/components/input/select', name: 'SelectComponent' }];
const SWITCH_COMPONENT: ImportDef[] = [...NG_FORM_MODULE, { from: '@wm/components/input/switch', name: 'SwitchComponent' }];
const INPUT_CALENDER_COMPONENT: ImportDef[] = [...NG_FORM_MODULE, { from: '@wm/components/input/text', name: 'InputCalendarComponent' }];
const INPUT_COLOR_COMPONENT: ImportDef[] = [...NG_FORM_MODULE, { from: '@wm/components/input/text', name: 'InputColorComponent' }];
const INPUT_EMAIL_COMPONENT: ImportDef[] = [...NG_FORM_MODULE, { from: '@wm/components/input/text', name: 'InputEmailComponent' }];
const INPUT_NUMBER_COMPONENT: ImportDef[] = [...NG_FORM_MODULE, { from: '@wm/components/input/text', name: 'InputNumberComponent' }];
const INPUT_TEXT_COMPONENT: ImportDef[] = [...NG_FORM_MODULE, { from: '@wm/components/input/text', name: 'InputTextComponent' }];
const TEXTAREA_COMPONENT: ImportDef[] = [...NG_FORM_MODULE, { from: '@wm/components/input/textarea', name: 'TextareaComponent' }];

// Data Components
const CARD_ACTIONS_DIRECTIVE: ImportDef[] = [{ from: '@wm/components/data/card', name: 'CardActionsDirective' }];
const CARD_CONTENT_COMPONENT: ImportDef[] = [...PARTIAL_CONTAINER, { from: '@wm/components/data/card', name: 'CardContentComponent' }];
const CARD_FOOTER_DIRECTIVE: ImportDef[] = [{ from: '@wm/components/data/card', name: 'CardFooterDirective' }];
const CARD_COMPONENT: ImportDef[] = [
    ...NGX_DROP_DOWN_MODULE,
    ...MENU_COMPONENT,
    ...CARD_ACTIONS_DIRECTIVE,
    ...CARD_CONTENT_COMPONENT,
    ...CARD_FOOTER_DIRECTIVE,
    { from: '@wm/components/data/card', name: 'CardComponent' }];
const LIST_ITEM_DIRECTIVE: ImportDef[] = [...PAGINATION_COMPONENT, { from: '@wm/components/data/list', name: 'ListItemDirective' }];
const LIST_COMPONENT: ImportDef[] = [...PAGINATION_COMPONENT, ...LIST_ITEM_DIRECTIVE, { from: '@wm/components/data/list', name: 'ListComponent' }];
const TABLE_CUD_DIRECTIVE: ImportDef[] = [{ from: '@wm/components/data/table', name: 'TableCUDDirective' }];
const TABLE_FILTER_SORT_DIRECTIVE: ImportDef[] = [{ from: '@wm/components/data/table', name: 'TableFilterSortDirective' }];
const TABLE_ACTION_DIRECTIVE: ImportDef[] = [{ from: '@wm/components/data/table', name: 'TableActionDirective' }];
const TABLE_COLUMN_DIRECTIVE: ImportDef[] = [{ from: '@wm/components/data/table', name: 'TableColumnDirective' }];
const TABLE_COLUMN_GROUP_DIRECTIVE: ImportDef[] = [{ from: '@wm/components/data/table', name: 'TableColumnGroupDirective' }];
const TABLE_ROW_DIRECTIVE: ImportDef[] = [{ from: '@wm/components/data/table', name: 'TableRowDirective' }, ...CONTAINER_DIRECTIVE, ...PARTIAL_CONTAINER];
const TABLE_ROW_ACTION_DIRECTIVE: ImportDef[] = [{ from: '@wm/components/data/table', name: 'TableRowActionDirective' }, ...BUTTON_COMPONENT];
const TABLE_COMPONENT: ImportDef[] = [
    ...NG_FORM_MODULE,
    ...NG_REACTIVE_FORM_MODULE,
    ...PAGINATION_COMPONENT,
    ...MENU_COMPONENT,
    ...NGX_TOOL_TIP_MODULE,
    ...LIST_COMPONENT,
    ...TABLE_ACTION_DIRECTIVE,
    ...TABLE_CUD_DIRECTIVE,
    ...TABLE_FILTER_SORT_DIRECTIVE,
    ...TABLE_COLUMN_DIRECTIVE,
    ...TABLE_COLUMN_GROUP_DIRECTIVE,
    ...TABLE_ROW_DIRECTIVE,
    ...TABLE_ROW_ACTION_DIRECTIVE,
    { from: '@wm/components/data/table', name: 'TableComponent' }];
const LIVE_TABLE_COMPONENT: ImportDef[] = [{ from: '@wm/components/data/live-table', name: 'LiveTableComponent' }];

// Form Components and Directives
const FORM_WIDGET_DIRECTIVE: ImportDef[] = [{ from: '@wm/components/data/form', name: 'FormWidgetDirective' }];
const FORM_ACTION_DIRECTIVE: ImportDef[] = [{ from: '@wm/components/data/form', name: 'FormActionDirective' }];
const FORM_FIELD_DIRECTIVE: ImportDef[] = [{ from: '@wm/components/data/form', name: 'FormFieldDirective' }];
const LIVE_ACTION_DIRECTIVE: ImportDef[] = [{ from: '@wm/components/data/form', name: 'LiveActionsDirective' }];
const DEPENDS_ON_DIRECTIVE: ImportDef[] = [{ from: '@wm/components/data/form', name: 'DependsonDirective' }];
const LIVE_FILTER_DIRECTIVE: ImportDef[] = [{ from: '@wm/components/data/form', name: 'LiveFilterDirective' }];
const LIVE_FORM_DIRECTIVE: ImportDef[] = [{ from: '@wm/components/data/form', name: 'LiveFormDirective' }];
const FORM_COMPONENT: ImportDef[] = [
    ...NG_FORM_MODULE,
    ...NG_REACTIVE_FORM_MODULE,
    ...FORM_ACTION_DIRECTIVE,
    ...FORM_WIDGET_DIRECTIVE,
    ...FORM_FIELD_DIRECTIVE,
    ...LIVE_ACTION_DIRECTIVE,
    ...DEPENDS_ON_DIRECTIVE,
    ...LIVE_FILTER_DIRECTIVE,
    ...LIVE_FORM_DIRECTIVE,
    { from: '@wm/components/data/form', name: 'FormComponent' }];

// Page Structure Components // TODO: PARTIAL_CONTAINER these needed ? appComponent has imports at root
const FOOTER_DIRECTIVE: ImportDef[] = [...PARTIAL_CONTAINER, { from: '@wm/components/page/footer', name: 'FooterDirective' }];
const HEADER_COMPONENT: ImportDef[] = [...PARTIAL_CONTAINER, { from: '@wm/components/page/header', name: 'HeaderComponent' }];
const LEFT_PANEL_DIRECTIVE: ImportDef[] = [...PARTIAL_CONTAINER, { from: '@wm/components/page/left-panel', name: 'LeftPanelDirective' }];
const RIGHT_PANEL_DIRECTIVE: ImportDef[] = [...PARTIAL_CONTAINER, { from: '@wm/components/page/right-panel', name: 'RightPanelDirective' }];
const PAGE_CONTENT_COMPONENT: ImportDef[] = [{ from: '@wm/components/page', name: 'PageContentComponent' }];
const SPA_PAGE_DIRECTIVE: ImportDef[] = [{ from: '@wm/components/page', name: 'SpaPageDirective' }];
const LAYOUT_DIRECTIVE: ImportDef[] = [{ from: '@wm/components/page', name: 'LayoutDirective' }];
const CONTENT_COMPONENT: ImportDef[] = [{ from: '@wm/components/page', name: 'ContentComponent' }];

// Advanced Components
const CAROUSEL_TEMPLATE_DIRECTIVE: ImportDef[] = [...NGX_CAROUSEL_MODULE, { from: '@wm/components/advanced/carousel', name: 'CarouselTemplateDirective' }];
const CAROUSEL_COMPONENT: ImportDef[] = [...NGX_CAROUSEL_MODULE, ...CAROUSEL_TEMPLATE_DIRECTIVE, { from: '@wm/components/advanced/carousel', name: 'CarouselDirective' }];
const CHART_COMPONENT: ImportDef[] = [{ from: '@wm/components/chart', name: 'ChartComponent' }, {from: '@wm/components/base', name: 'RedrawableDirective'}];
const CUSTOM_WIDGET_CONTAINER_DIRECTIVE: ImportDef[] = [{ from: '@wm/components/advanced/custom', name: 'CustomWidgetContainerDirective' }];
const CUSTOM_WIDGET_DIRECTIVE: ImportDef[] = [...CUSTOM_WIDGET_CONTAINER_DIRECTIVE, { from: '@wm/components/advanced/custom', name: 'CustomWidgetDirective' }];
const LOGIN_COMPONENT: ImportDef[] = [{ from: '@wm/components/advanced/login', name: 'LoginComponent' }];
const MARQUEE_DIRECTIVE: ImportDef[] = [{ from: '@wm/components/advanced/marquee', name: 'MarqueeDirective' }];
const PREFAB_CONTAINER_DIRECTIVE: ImportDef[] = [{ from: '@wm/components/prefab', name: 'PrefabContainerDirective' }];
const PREFAB_DIRECTIVE: ImportDef[] = [{ from: '@wm/components/prefab', name: 'PrefabDirective' }];
const RICH_TEXT_EDITOR_COMPONENT: ImportDef[] = [{ from: '@wm/components/basic/rich-text-editor', name: 'RichTextEditorComponent' }];
const TREE_COMPONENT: ImportDef[] = [{ from: '@wm/components/basic/tree', name: 'TreeComponent' }];

// Pipes
const TO_DATE_PIPE: ImportDef[] = [{ from: '@wm/components/base', name: 'ToDatePipe' }];
const TO_CURRENCY_PIPE: ImportDef[] = [{ from: '@wm/components/base', name: 'ToCurrencyPipe' }];
const NUMBER_TO_STRING_PIPE: ImportDef[] = [{ from: '@wm/components/base', name: 'NumberToStringPipe' }];
const STRING_TO_NUMBER_PIPE: ImportDef[] = [{ from: '@wm/components/base', name: 'StringToNumberPipe' }];
const TIME_FROM_NOW_PIPE: ImportDef[] = [{ from: '@wm/components/base', name: 'TimeFromNowPipe' }];
const PREFIX_PIPE: ImportDef[] = [{ from: '@wm/components/base', name: 'PrefixPipe' }];
const SUFFIX_PIPE: ImportDef[] = [{ from: '@wm/components/base', name: 'SuffixPipe' }];
const CUSTOM_PIPE: ImportDef[] = [{ from: '@wm/components/base', name: 'CustomPipe' }];

export const WIDGET_IMPORTS: Map<string, ImportDef[]> = new Map([
    ['wm-accordion', ACCORDION_DIRECTIVE],
    ['wm-accordionpane', ACCORDION_PANE_COMPONENT],
    ['wm-anchor', ANCHOR_COMPONENT],
    ['wm-alertdialog', ALERT_DIALOG_COMPONENT],
    ['wm-audio', AUDIO_COMPONENT],
    ['wm-button', BUTTON_COMPONENT],
    ['wm-buttongroup', BUTTON_GROUP_DIRECTIVE],
    ['wm-breadcrumb', BREAD_CRUMB_COMPONENT],
    ['wm-calendar', CALENDAR_COMPONENT],
    ['wm-card', CARD_COMPONENT],
    ['wm-card-actions', CARD_ACTIONS_DIRECTIVE],
    ['wm-card-content', CARD_CONTENT_COMPONENT],
    ['wm-card-footer', CARD_FOOTER_DIRECTIVE],
    ['wm-carousel', CAROUSEL_COMPONENT],
    ['wm-carousel-content', CAROUSEL_TEMPLATE_DIRECTIVE],
    ['wm-carousel-template', CAROUSEL_TEMPLATE_DIRECTIVE],
    ['wm-chart', CHART_COMPONENT],
    ['wm-checkbox', CHECKBOX_COMPONENT],
    ['wm-checkboxset', CHECKBOXSET_COMPONENT],
    ['wm-chips', CHIPS_COMPONENT],
    ['wm-colorpicker', COLOR_PICKER_COMPONENT],
    ['wm-confirmdialog', CONFIRM_DIALOG_COMPONENT],
    ['wm-container', CONTAINER_DIRECTIVE],
    ['wm-param', PARTIAL_PARAM_DIRECTIVE],
    ['wm-content', CONTENT_COMPONENT],
    ['wm-currency', CURRENCY_COMPONENT],
    ['wm-date', DATE_COMPONENT],
    ['wm-datetime', DATE_TIME_COMPONENT],
    ['wm-dialog', DESIGN_DIALOG_COMPONENT],
    ['wm-dialogactions', DIALOGACTIONS_DIRECTIVE],
    ['wm-footer', FOOTER_DIRECTIVE],
    ['wm-form', FORM_COMPONENT],
    ['wm-form-action', FORM_ACTION_DIRECTIVE],
    ['wm-form-field', FORM_FIELD_DIRECTIVE],
    ['wm-filter-field', LIVE_FILTER_DIRECTIVE],
    ['wm-fileupload', FILE_UPLOAD_COMPONENT],
    ['wm-gridrow', LAYOUT_GRID_ROW_DIRECTIVE],
    ['wm-gridcolumn', LAYOUT_GRID_COLUMN_DIRECTIVE],
    ['wm-header', HEADER_COMPONENT],
    ['wm-html', HTML_COMPONENT],
    ['wm-icon', ICON_COMPONENT],
    ['wm-iframe', IFRAME_COMPONENT],
    ['wm-iframedialog', IFRAME_DIALOG_COMPONENT],
    ['wm-label', LABEL_COMPONENT],
    ['wm-layout', LAYOUT_DIRECTIVE],
    ['wm-layoutgrid', LAYOUT_GRID_DIRECTIVE],
    ['wm-left-panel', LEFT_PANEL_DIRECTIVE],
    ['wm-linearlayout', LINEAR_LAYOUT_DIRECTIVE],
    ['wm-linearlayoutitem', LINEAR_LAYOUT_ITEM_DIRECTIVE],
    ['wm-list', LIST_COMPONENT],
    ['wm-livetable', LIVE_TABLE_COMPONENT],
    ['wm-login', LOGIN_COMPONENT],
    ['wm-custom', CUSTOM_WIDGET_DIRECTIVE],
    ['wm-logindialog', LOGIN_DIALOG_DIRECTIVE],
    ['wm-marquee', MARQUEE_DIRECTIVE],
    ['wm-menu', MENU_COMPONENT],
    ['wm-message', MESSAGE_COMPONENT],
    ['wm-nav', NAV_COMPONENT],
    ['wm-navbar', NAVBAR_COMPONENT],
    ['wm-nav-item', NAV_ITEM_DIRECTIVE],
    ['wm-number', NUMBER_COMPONENT],
    ['wm-partial', PARTIAL_DIRECTIVE],
    ['wm-page', PAGE_COMPONENT],
    ['wm-page-content', PAGE_CONTENT_COMPONENT],
    ['spa-page-content', SPA_PAGE_DIRECTIVE],
    ['wm-pagedialog', PARTIAL_DIALOG_COMPONENT],
    ['wm-pagination', PAGINATION_COMPONENT],
    ['wm-panel', PANEL_COMPONENT],
    ['wm-panel-footer', PANEL_COMPONENT],
    ['wm-picture', PICTURE_COMPONENT],
    ['wm-popover', POPOVER_COMPONENT],
    ['wm-progress-bar', PROGRESS_BAR_COMPONENT],
    ['wm-prefab', PREFAB_DIRECTIVE],
    ['wm-prefab-container', PREFAB_CONTAINER_DIRECTIVE],
    ['wm-progress-circle', PROGRESS_CIRCLE_COMPONENT],
    ['wm-radioset', RADIOSET_COMPONENT],
    ['wm-rating', RATING_COMPONENT],
    ['wm-richtexteditor', RICH_TEXT_EDITOR_COMPONENT],
    ['wm-right-panel', RIGHT_PANEL_DIRECTIVE],
    ['wm-select', SELECT_COMPONENT],
    ['wm-search', SEARCH_COMPONENT],
    ['wm-slider', SLIDER_COMPONENT],
    ['wm-spinner', SPINNER_COMPONENT],
    ['wm-switch', SWITCH_COMPONENT],
    ['wm-table', TABLE_COMPONENT],
    ['wm-tabs', TABS_COMPONENT],
    ['wm-tabpane', TAB_PANE_COMPONENT],
    ['wm-text', [...INPUT_TEXT_COMPONENT, ...INPUT_CALENDER_COMPONENT, ...INPUT_COLOR_COMPONENT, ...INPUT_EMAIL_COMPONENT, ...INPUT_NUMBER_COMPONENT]],
    ['wm-textarea', TEXTAREA_COMPONENT],
    ['wm-time', TIME_COMPONENT],
    ['wm-tile', TILE_DIRECTIVE],
    ['wm-top-nav', TOP_NAV_DIRECTIVE],
    ['wm-tree', TREE_COMPONENT],
    ['wm-video', VIDEO_COMPONENT],
    ['wm-wizard', WIZARD_COMPONENT],
    ['wm-wizardstep', WIZARD_COMPONENT],

    ['toDate', TO_DATE_PIPE],
    ['toCurrency', TO_CURRENCY_PIPE],
    ['numberToString', NUMBER_TO_STRING_PIPE],
    ['stringToNumber', STRING_TO_NUMBER_PIPE],
    ['timeFromNow', TIME_FROM_NOW_PIPE],
    ['prefix', PREFIX_PIPE],
    ['suffix', SUFFIX_PIPE],
    ['custom', CUSTOM_PIPE],
]);
