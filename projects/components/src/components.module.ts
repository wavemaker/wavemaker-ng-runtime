import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';

import {
    BsDatepickerModule,
    BsDropdownModule,
    CarouselModule,
    DatepickerModule,
    ModalModule,
    PopoverModule,
    ProgressbarModule,
    TimepickerModule,
    TypeaheadModule
} from 'ngx-bootstrap';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ColorPickerModule } from 'ngx-color-picker';
import { TextMaskModule } from 'angular2-text-mask';
import { NgCircleProgressModule } from 'ng-circle-progress';

import { AbstractDialogService } from '@wm/core';
import { SecurityModule } from '@wm/security';

import { AccordionDirective } from './widgets/common/accordion/accordion.directive';
import { AccordionPaneComponent } from './widgets/common/accordion/accordion-pane/accordion-pane.component';
import { TabsComponent } from './widgets/common/tabs/tabs.component';
import { TabPaneComponent } from './widgets/common/tabs/tab-pane/tab-pane.component';
import { AlertDialogComponent } from './widgets/common/dialog/alert-dialog/alert-dialog.component';
import { AnchorComponent } from './widgets/common/anchor/anchor.component';
import { AudioComponent } from './widgets/common/audio/audio.component';
import { BreadcrumbComponent } from './widgets/common/breadcrumb/breadcrumb.component';
import { ButtonComponent } from './widgets/common/button/button.component';
import { ButtonGroupDirective } from './widgets/common/button-group/button-group.directive';
import { CalendarComponent } from './widgets/common/calendar/calendar.component';
import { CardComponent } from './widgets/common/card/card.component';
import { CardActionsDirective } from './widgets/common/card/card-actions/card-actions.directive';
import { CardContentComponent } from './widgets/common/card/card-content/card-content.component';
import { CardFooterDirective } from './widgets/common/card/card-footer/card-footer.directive';
import { CarouselDirective } from './widgets/common/carousel/carousel.directive';
import { CarouselTemplateDirective } from './widgets/common/carousel/carousel-template/carousel-template.directive';
import { ChartComponent } from './widgets/common/chart/chart.component';
import { CheckboxComponent } from './widgets/common/checkbox/checkbox.component';
import { CheckboxsetComponent } from './widgets/common/checkboxset/checkboxset.component';
import { ChipsComponent } from './widgets/common/chips/chips.component';
import { ProgressCircleComponent } from './widgets/common/progress-bar/progress-circle/progress-circle.component';
import { ColorPickerComponent } from './widgets/common/color-picker/color-picker.component';
import { CompositeDirective } from './widgets/common/composite/composite.directive';
import { ConfirmDialogComponent } from './widgets/common/dialog/confirm-dialog/confirm-dialog.component';
import { ContainerDirective } from './widgets/common/container/container.directive';
import { ContentComponent } from './widgets/common/content/content.component';
import { CurrencyComponent } from './widgets/common/currency/currency.component';
import { DateComponent } from './widgets/common/date/date.component';
import { DatetimeComponent } from './widgets/common/date-time/date-time.component';
import { DependsonDirective } from './widgets/common/form/live-actions/dependson.directive';
import { DialogComponent } from './widgets/common/dialog/design-dialog/dialog.component';
import { DialogBodyDirective } from './widgets/common/dialog/base/dialog-body/dialog-body.directive';
import { DialogFooterDirective } from './widgets/common/dialog/base/dialog-footer/dialog-footer.directive';
import { DialogHeaderComponent } from './widgets/common/dialog/base/dialog-header/dialog-header.component';
import { FooterDirective } from './widgets/common/footer/footer.directive';
import { FormActionDirective } from './widgets/common/form/form-action/form-action.directive';
import { FormComponent } from './widgets/common/form/form.component';
import { FormFieldDirective } from './widgets/common/form/form-field/form-field.directive';
import { HeaderComponent } from './widgets/common/header/header.component';
import { HtmlDirective } from './widgets/common/html/html.directive';
import { IconComponent } from './widgets/common/icon/icon.component';
import { IframeComponent } from './widgets/common/iframe/iframe.component';
import { IframeDialogComponent } from './widgets/common/dialog/iframe-dialog/iframe-dialog.component';
import { ImagePipe } from './pipes/image.pipe';
import { InputCalendarComponent } from './widgets/common/text/calendar/input-calendar.component';
import { InputColorComponent } from './widgets/common/text/color/input-color.component';
import { InputEmailComponent } from './widgets/common/text/email/input-email.component';
import { InputNumberComponent } from './widgets/common/text/number/input-number.component';
import { InputTextComponent } from './widgets/common/text/text/input-text.component';
import { FormWidgetDirective } from './widgets/common/form/form-widget.directive';
import { LabelDirective } from './widgets/common/label/label.directive';
import { LayoutGridColumnDirective } from './widgets/common/layout-grid/layout-grid-column/layout-grid-column.directive';
import { LayoutgridDirective } from './widgets/common/layout-grid/layout-grid.directive';
import { LayoutGridRowDirective } from './widgets/common/layout-grid/layout-grid-row/layout-grid-row.directive';
import { LazyLoadDirective } from './widgets/common/lazy-load/lazy-load.directive';
import { LeftPanelDirective } from './widgets/common/left-panel/left-panel.directive';
import { ListComponent } from './widgets/common/list/list.component';
import { ListItemDirective } from './widgets/common/list/list-item.directive';
import { LiveActionsDirective } from './widgets/common/form/live-actions/live-actions.directive';
import { LiveFormDirective } from './widgets/common/form/live-form/live-form.directive';
import { LiveFilterDirective } from './widgets/common/form/live-filter/live-filter.directive';
import { LiveTableComponent } from './widgets/common/live-table/live-table.component';
import { LoginComponent } from './widgets/common/login/login.component';
import { MarqueeDirective } from './widgets/common/marquee/marquee.directive';
import { MenuComponent } from './widgets/common/menu/menu.component';
import { MenuDropdownComponent } from './widgets/common/menu/menu-dropdown/menu-dropdown.component';
import { MenuDropdownItemComponent } from './widgets/common/menu/menu-dropdown-item/menu-dropdown-item.component';
import { MessageComponent } from './widgets/common/message/message.component';
import { NavbarComponent } from './widgets/common/navbar/navbar.component';
import { NavComponent } from './widgets/common/nav/nav.component';
import { NavItemDirective } from './widgets/common/nav/nav-item/nav-item.directive';
import { NavigationControlDirective } from './widgets/common/nav/navigation-control.directive';
import { NumberComponent } from './widgets/common/number/number.component';
import { PageContentComponent } from './widgets/common/page-content/page-content.component';
import { PageDirective } from './widgets/common/page/page.directive';
import { PaginationComponent } from './widgets/common/pagination/pagination.component';
import { PanelComponent } from './widgets/common/panel/panel.component';
import { PartialDialogComponent } from './widgets/common/dialog/partial-dialog/partial-dialog.component';
import { PartialDirective } from './widgets/common/partial/partial.directive';
import {
    PartialParamDirective,
    PartialParamHandlerDirective
} from './widgets/common/partial-param/partial-param.directive';
import { PrefabContainerDirective } from './widgets/common/prefab-container/prefab-container.directive';
import { PictureDirective } from './widgets/common/picture/picture.directive';
import { PopoverComponent } from './widgets/common/popover/popover.component';
import { PrefabDirective } from './widgets/common/prefab/prefab.directive';
import { ProgressBarComponent } from './widgets/common/progress-bar/progress-bar.component';
import { RadiosetComponent } from './widgets/common/radioset/radioset.component';
import { RatingComponent } from './widgets/common/rating/rating.component';
import { RedrawableDirective } from './widgets/common/redraw/redrawable.directive';
import { RenderComponentDirective } from './widgets/common/search/render-component.directive';
import { RichTextEditorComponent } from './widgets/common/rich-text-editor/rich-text-editor.component';
import { RightPanelDirective } from './widgets/common/right-panel/right-panel.directive';
import { SearchComponent } from './widgets/common/search/search.component';
import { ScrollableDirective } from './widgets/common/search/scrollable.directive';
import { SelectComponent } from './widgets/common/select/select.component';
import { ShowInDeviceDirective } from './directives/show-in-device.directive';
import { SliderComponent } from './widgets/common/slider/slider.component';
import { SmoothScrollDirective } from './widgets/common/smooth-scroll/smooth-scroll.directive';
import { SpinnerComponent } from './widgets/common/spinner/spinner.component';
import { SwitchComponent } from './widgets/common/switch/switch.component';
import { TableActionDirective } from './widgets/common/table/table-action/table-action.directive';
import { TableColumnDirective } from './widgets/common/table/table-column/table-column.directive';
import { TableColumnGroupDirective } from './widgets/common/table/table-column-group/table-column-group.directive';
import { TableComponent } from './widgets/common/table/table.component';
import { TableCUDDirective } from './widgets/common/table/table-cud.directive';
import { TableFilterSortDirective } from './widgets/common/table/table-filter.directive';
import { TableRowActionDirective } from './widgets/common/table/table-row-action/table-row-action.directive';
import { TableRowDirective } from './widgets/common/table/table-row/table-row.directive';
import { TextareaComponent } from './widgets/common/textarea/textarea.component';
import { TextContentDirective } from './widgets/common/base/text-content.directive';
import { TileDirective } from './widgets/common/tile/tile.directive';
import { TimeComponent } from './widgets/common/time/time.component';
import { TopNavDirective } from './widgets/common/top-nav/top-nav.directive';
import { TreeDirective } from './widgets/common/tree/tree.directive';
import { VideoComponent } from './widgets/common/video/video.component';
import {
    FileExtensionFromMimePipe,
    FileIconClassPipe,
    FileSizePipe,
    FilterPipe,
    NumberToStringPipe,
    PrefixPipe,
    StateClassPipe,
    StringToNumberPipe,
    SuffixPipe,
    TimeFromNowPipe,
    ToCurrencyPipe,
    ToDatePipe,
    ToNumberPipe
} from './pipes/custom-pipes';
import { TrustAsPipe } from './pipes/trust-as.pipe';
import { WizardComponent } from './widgets/common/wizard/wizard.component';
import { WizardStepDirective } from './widgets/common/wizard/wizard-step/wizard-step.directive';
import { OnFileSelectDirective } from './widgets/common/file-upload/common.directive';
import { FileUploadComponent } from './widgets/common/file-upload/file-upload.component';
import { LoginDialogDirective } from './widgets/common/dialog/login-dialog/login-dialog.directive';
import { DialogServiceImpl } from './widgets/common/dialog/dialog.service';


const wmComponents = [
    AccordionDirective,
    AccordionPaneComponent,
    TabsComponent,
    TabPaneComponent,
    AlertDialogComponent,
    AnchorComponent,
    AudioComponent,
    BreadcrumbComponent,
    ButtonComponent,
    ButtonGroupDirective,
    CalendarComponent,
    CardComponent,
    CardActionsDirective,
    CardContentComponent,
    CardFooterDirective,
    CarouselDirective,
    CarouselTemplateDirective,
    ChartComponent,
    CheckboxComponent,
    ProgressCircleComponent,
    ColorPickerComponent,
    CompositeDirective,
    ConfirmDialogComponent,
    ContainerDirective,
    ContentComponent,
    CurrencyComponent,
    CheckboxsetComponent,
    ChipsComponent,
    DateComponent,
    DatetimeComponent,
    DependsonDirective,
    DialogComponent,
    DialogBodyDirective,
    DialogFooterDirective,
    DialogHeaderComponent,
    FooterDirective,
    LoginDialogDirective,
    FormActionDirective,
    FormComponent,
    FormFieldDirective,
    HeaderComponent,
    HtmlDirective,
    IconComponent,
    IframeComponent,
    IframeDialogComponent,
    InputCalendarComponent,
    InputColorComponent,
    InputEmailComponent,
    InputNumberComponent,
    InputTextComponent,
    FileUploadComponent,
    FormWidgetDirective,
    LabelDirective,
    LayoutGridColumnDirective,
    LayoutgridDirective,
    LayoutGridRowDirective,
    LazyLoadDirective,
    LeftPanelDirective,
    ListComponent,
    ListItemDirective,
    LiveActionsDirective,
    LiveFilterDirective,
    LiveFormDirective,
    LiveTableComponent,
    LoginComponent,
    MarqueeDirective,
    MenuComponent,
    MenuDropdownComponent,
    MenuDropdownItemComponent,
    MessageComponent,
    NavbarComponent,
    NavComponent,
    NavItemDirective,
    NavigationControlDirective,
    NumberComponent,
    OnFileSelectDirective,
    PageContentComponent,
    PageDirective,
    PaginationComponent,
    PanelComponent,
    PartialDialogComponent,
    PartialDirective,
    PartialParamHandlerDirective,
    PartialParamDirective,
    PictureDirective,
    PopoverComponent,
    PrefabDirective,
    PrefabContainerDirective,
    ProgressBarComponent,
    RadiosetComponent,
    RatingComponent,
    RedrawableDirective,
    RenderComponentDirective,
    RichTextEditorComponent,
    RightPanelDirective,
    ScrollableDirective,
    SearchComponent,
    SelectComponent,
    ShowInDeviceDirective,
    SliderComponent,
    SmoothScrollDirective,
    SpinnerComponent,
    SwitchComponent,
    TableActionDirective,
    TableColumnDirective,
    TableColumnGroupDirective,
    TableComponent,
    TableCUDDirective,
    TableFilterSortDirective,
    TableRowDirective,
    TableRowActionDirective,
    TextareaComponent,
    TextContentDirective,
    TileDirective,
    TimeComponent,
    TopNavDirective,
    TreeDirective,
    VideoComponent,
    WizardComponent,
    WizardStepDirective
];

const PIPES = [
    ToDatePipe,
    FileIconClassPipe,
    FileExtensionFromMimePipe,
    FilterPipe,
    FileSizePipe,
    ToNumberPipe,
    ToCurrencyPipe,
    PrefixPipe,
    SuffixPipe,
    TimeFromNowPipe,
    NumberToStringPipe,
    StateClassPipe,
    StringToNumberPipe,
    TrustAsPipe,
    ImagePipe
];

export const bsDatePickerModule: ModuleWithProviders = BsDatepickerModule.forRoot();
export const datepickerModule: ModuleWithProviders = DatepickerModule.forRoot();
export const timepickerModule: ModuleWithProviders = TimepickerModule.forRoot();
export const bsDropdownModule: ModuleWithProviders = BsDropdownModule.forRoot();
export const paginationModule: ModuleWithProviders = PaginationModule.forRoot();
export const typeaheadModule: ModuleWithProviders = TypeaheadModule.forRoot();
export const progressbarModule: ModuleWithProviders = ProgressbarModule.forRoot();
export const carouselModule: ModuleWithProviders = CarouselModule.forRoot();
export const popoverModule: ModuleWithProviders = PopoverModule.forRoot();
export const ngCircleProgressModule: ModuleWithProviders = NgCircleProgressModule.forRoot({});

@NgModule({
    imports: [
        ColorPickerModule,
        CommonModule,
        FormsModule,
        ModalModule,
        SecurityModule,
        TextMaskModule,
        bsDatePickerModule,
        datepickerModule,
        timepickerModule,
        bsDropdownModule,
        paginationModule,
        typeaheadModule,
        progressbarModule,
        carouselModule,
        popoverModule,
        ngCircleProgressModule
    ],
    declarations: [...wmComponents, ...PIPES],
    exports: [...wmComponents, ...PIPES],
    entryComponents: [
        MenuComponent,
        MenuDropdownComponent
    ]
})
export class WmComponentsModule {

    static forRoot(): ModuleWithProviders {
        return {
            ngModule: WmComponentsModule,
            providers: [
                ToDatePipe,
                FilterPipe,
                TrustAsPipe,
                ImagePipe,
                Location,
                {provide: AbstractDialogService, useClass: DialogServiceImpl}
            ]
        };
    }
}
