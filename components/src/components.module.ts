import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BsDatepickerModule, BsDropdownModule, ModalModule, ProgressbarModule, TimepickerModule, TypeaheadModule } from 'ngx-bootstrap';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ColorPickerModule } from 'ngx-color-picker';
import { NgxMaskModule } from 'ngx-mask';

import { DialogService } from './widgets/common/dialog/dialog.service';

import { AccordionDirective } from './widgets/common/accordion/accordion.directive';
import { AccordionPaneComponent } from './widgets/common/accordion/accordion-pane/accordion-pane.component';
import { AlertDialogComponent } from './widgets/common/dialog/alert-dialog/alert-dialog.component';
import { AnchorComponent } from './widgets/common/anchor/anchor.component';
import { AudioComponent } from './widgets/common/audio/audio.component';
import { ButtonComponent } from './widgets/common/button/button.component';
import { ButtonGroupDirective } from './widgets/common/button-group/button-group.directive';
import { CalendarComponent } from './widgets/common/calendar/calendar.component';
import { ChartComponent } from './widgets/common/chart/chart.component';
import { CheckboxComponent } from './widgets/common/checkbox/checkbox.component';
import { CheckboxsetComponent } from './widgets/common/checkboxset/checkboxset.component';
import { ColorPickerComponent } from './widgets/common/color-picker/color-picker.component';
import { CompositeDirective } from './widgets/common/composite/composite.directive';
import { ConfirmDialogComponent } from './widgets/common/dialog/confirm-dialog/confirm-dialog.component';
import { ContainerDirective } from './widgets/common/container/container.directive';
import { ContentComponent } from './widgets/common/content/content.component';
import { CurrencyComponent } from './widgets/common/currency/currency.component';
import { DateComponent } from './widgets/common/date/date.component';
import { DatetimeComponent } from './widgets/common/date-time/date-time.component';
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
import { LeftPanelDirective } from './widgets/common/left-panel/left-panel.directive';
import { ListComponent } from './widgets/common/list/list.component';
import { ListItemDirective } from './widgets/common/list/list-item.directive';
import { LiveFormDirective } from './widgets/common/form/live-form.directive';
import { LiveFilterDirective } from './widgets/common/form/live-filter.directive';
import { LiveTableComponent } from './widgets/common/live-table/live-table.component';
import { LoginComponent } from './widgets/common/login/login.component';
import { MenuComponent } from './widgets/common/menu/menu.component';
import { MenuDropdownComponent } from './widgets/common/menu/menu-dropdown.component';
import { MenuDropdownItemComponent } from './widgets/common/menu/menu-dropdown-item.component';
import { MessageComponent } from './widgets/common/message/message.component';
import { NavbarComponent } from './widgets/common/navbar/navbar.component';
import { NavDirective } from './widgets/common/nav/nav.directive';
import { NavItemDirective } from './widgets/common/nav-item/nav-item.directive';
import { PageContentDirective } from './widgets/common/page-content/page-content.directive';
import { PageDirective } from './widgets/common/page/page.directive';
import { PaginationComponent } from './widgets/common/pagination/pagination.component';
import { PanelComponent } from './widgets/common/panel/panel.component';
import { PartialDialogComponent } from './widgets/common/dialog/partial-dialog/partial-dialog.component';
import { PartialDirective } from './widgets/common/partial/partial.directive';
import { PictureDirective } from './widgets/common/picture/picture.directive';
import { PrefabDirective } from './widgets/common/prefab/prefab.directive';
import { ProgressBarComponent } from './widgets/common/progress-bar/progress-bar.component';
import { RadiosetComponent } from './widgets/common/radioset/radioset.component';
import { RatingComponent } from './widgets/common/rating/rating.component';
import { RedrawableDirective } from './widgets/common/redraw/redrawable.directive';
import { RichTextEditorComponent } from './widgets/common/rich-text-editor/rich-text-editor.component';
import { RightPanelDirective } from './widgets/common/right-panel/right-panel.directive';
import { SearchComponent } from './widgets/common/search/search.component';
import { SelectComponent } from './widgets/common/select/select.component';
import { ShowInDeviceDirective } from './directives/show-in-device.directive';
import { SliderComponent } from './widgets/common/slider/slider.component';
import { SpinnerComponent } from './widgets/common/spinner/spinner.component';
import { SwitchComponent } from './widgets/common/switch/switch.component';
import { TableActionDirective } from './widgets/common/table/table-action/table-action.directive';
import { TableColumnDirective } from './widgets/common/table/table-column/table-column.directive';
import { TableColumnGroupDirective } from './widgets/common/table/table-column-group/table-column-group.directive';
import { TableComponent } from './widgets/common/table/table.component';
import { TableRowActionDirective } from './widgets/common/table/table-row-action/table-row-action.directive';
import { TextareaDirective } from './widgets/common/textarea/textarea.directive';
import { TileDirective } from './widgets/common/tile/tile.directive';
import { TimeComponent } from './widgets/common/time/time.component';
import { TopNavDirective } from './widgets/common/top-nav/top-nav.directive';
import { TreeDirective } from './widgets/common/tree/tree.directive';
import { VideoComponent } from './widgets/common/video/video.component';
import { FilterPipe, NumberToStringPipe, PrefixPipe, StringToNumberPipe, SuffixPipe, TimeFromNowPipe, ToCurrencyPipe, ToDatePipe, ToNumberPipe } from './pipes/custom-pipes';
import { TrustAsPipe } from './pipes/trust-as.pipe';
import { WmAutocompleteDirective } from './directives/wm-autocomplete.directive';

const wmComponents = [
    AccordionDirective,
    AccordionPaneComponent,
    AlertDialogComponent,
    AnchorComponent,
    AudioComponent,
    ButtonComponent,
    ButtonGroupDirective,
    CalendarComponent,
    ChartComponent,
    CheckboxComponent,
    ColorPickerComponent,
    CompositeDirective,
    ConfirmDialogComponent,
    ContainerDirective,
    ContentComponent,
    CurrencyComponent,
    CheckboxsetComponent,
    DateComponent,
    DatetimeComponent,
    DialogComponent,
    DialogBodyDirective,
    DialogFooterDirective,
    DialogHeaderComponent,
    FooterDirective,
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
    FormWidgetDirective,
    LabelDirective,
    LayoutGridColumnDirective,
    LayoutgridDirective,
    LayoutGridRowDirective,
    LeftPanelDirective,
    ListComponent,
    ListItemDirective,
    LiveFilterDirective,
    LiveFormDirective,
    LiveTableComponent,
    LoginComponent,
    MenuComponent,
    MenuDropdownComponent,
    MenuDropdownItemComponent,
    MessageComponent,
    NavbarComponent,
    NavDirective,
    NavItemDirective,
    PageContentDirective,
    PageDirective,
    PaginationComponent,
    PanelComponent,
    PartialDialogComponent,
    PartialDirective,
    PictureDirective,
    PrefabDirective,
    ProgressBarComponent,
    RadiosetComponent,
    RatingComponent,
    RedrawableDirective,
    RichTextEditorComponent,
    RightPanelDirective,
    SearchComponent,
    SelectComponent,
    ShowInDeviceDirective,
    SliderComponent,
    SpinnerComponent,
    SwitchComponent,
    TableActionDirective,
    TableColumnDirective,
    TableColumnGroupDirective,
    TableComponent,
    TableRowActionDirective,
    TextareaDirective,
    TileDirective,
    TimeComponent,
    TopNavDirective,
    TreeDirective,
    VideoComponent,
    WmAutocompleteDirective
];

const PIPES = [
    ToDatePipe,
    FilterPipe,
    ToNumberPipe,
    ToCurrencyPipe,
    PrefixPipe,
    SuffixPipe,
    TimeFromNowPipe,
    NumberToStringPipe,
    StringToNumberPipe,
    TrustAsPipe,
    ImagePipe
];

@NgModule({
    imports: [
        ColorPickerModule,
        CommonModule,
        FormsModule,
        BsDatepickerModule.forRoot(),
        TimepickerModule.forRoot(),
        BsDropdownModule.forRoot(),
        PaginationModule.forRoot(),
        TypeaheadModule.forRoot(),
        ProgressbarModule.forRoot(),
        ModalModule.forRoot(),
        NgxMaskModule.forRoot()
    ],
    declarations: [...wmComponents, ...PIPES],
    exports: [...wmComponents, ...PIPES],
    providers: [
        DialogService,
        ToDatePipe,
        FilterPipe,
        TrustAsPipe,
        ImagePipe
    ],
    entryComponents: [
        MenuComponent,
        MenuDropdownComponent
    ]
})
export class WmComponentsModule {
}

