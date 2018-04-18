import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BsDatepickerModule, BsDropdownModule, ModalModule, ProgressbarModule, TimepickerModule, TypeaheadModule } from 'ngx-bootstrap';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ColorPickerModule } from 'ngx-color-picker';

import { DialogService } from './widgets/web/dialog/dialog.service';

import { AccordionDirective } from './widgets/web/accordion/accordion.component';
import { AccordionPaneComponent } from './widgets/web/accordion/accordion-pane/accordion-pane.component';
import { AlertDialogComponent } from './widgets/web/dialog/alert-dialog/alert-dialog.component';
import { AnchorComponent } from './widgets/web/anchor/anchor.component';
import { AudioComponent } from './widgets/web/audio/audio.component';
import { ButtonComponent } from './widgets/web/button/button.component';
import { ButtonGroupDirective } from './widgets/web/button-group/button-group.directive';
import { CalendarComponent } from './widgets/web/calendar/calendar.component';
import { ChartComponent } from './widgets/web/chart/chart.component';
import { CheckboxComponent } from './widgets/web/checkbox/checkbox.component';
import { ColorPickerComponent } from './widgets/web/color-picker/color-picker.component';
import { CompositeComponent } from './widgets/web/composite/composite.component';
import { ConfirmDialogComponent } from './widgets/web/dialog/confirm-dialog/confirm-dialog.component';
import { ContainerDirective } from './widgets/web/container/container.directive';
import { ContentComponent } from './widgets/web/content/content.component';
import { CurrencyComponent } from './widgets/web/currency/currency.component';
import { DateComponent } from './widgets/web/date/date.component';
import { DatetimeComponent } from './widgets/web/date-time/date-time.component';
import { DialogActionsComponent } from './widgets/web/dialog/dialog-actions/dialog-actions.component';
import { DialogComponent } from './widgets/web/dialog/dialog.component';
import { DialogHeaderComponent } from './widgets/web/dialog/dialog-header/dialog-header.component';
import { FooterDirective } from './widgets/web/footer/footer.directive';
import { FormActionDirective } from './widgets/web/form/form-action/form-action.directive';
import { FormComponent } from './widgets/web/form/form.component';
import { FormFieldDirective } from './widgets/web/form-field/form-field.directive';
import { HeaderComponent } from './widgets/web/header/header.component';
import { HtmlDirective } from './widgets/web/html/html.directive';
import { IconComponent } from './widgets/web/icon/icon.component';
import { IframeComponent } from './widgets/web/iframe/iframe.component';
import { IframeDialogComponent } from './widgets/web/dialog/iframe-dialog/iframe-dialog.component';
import { FormWidgetDirective } from './widgets/web/form/form-widget.directive';
import { LabelDirective } from './widgets/web/label/label.directive';
import { LayoutGridColumnComponent } from './widgets/web/layout-grid/layout-grid-column/layout-grid-column.component';
import { LayoutgridDirective } from './widgets/web/layout-grid/layout-grid.directive';
import { LayoutGridRowDirective } from './widgets/web/layout-grid/layout-grid-row/layout-grid-row.directive';
import { LeftPanelComponent } from './widgets/web/left-panel/left-panel.component';
import { ListComponent } from './widgets/web/list/list.component';
import { ListItemDirective } from './widgets/web/list/list-item.directive';
import { LiveFormDirective } from './widgets/web/form/live-form.directive';
import { LiveTableComponent } from './widgets/web/live-table/live-table.component';
import { LoginComponent } from './widgets/web/login/login.component';
import { MenuComponent } from './widgets/web/menu/menu.component';
import { MenuDropdownComponent } from './widgets/web/menu/menu-dropdown.component';
import { MenuDropdownItemComponent } from './widgets/web/menu/menu-dropdown-item.component';
import { MessageComponent } from './widgets/web/message/message.component';
import { NavbarComponent } from './widgets/web/navbar/navbar.component';
import { NavDirective } from './widgets/web/nav/nav.directive';
import { NavItemDirective } from './widgets/web/nav-item/nav-item.directive';
import { PageContentComponent } from './widgets/web/page-content/page-content.component';
import { PageDirective } from './widgets/web/page/page.directive';
import { PaginationComponent } from './widgets/web/pagination/pagination.component';
import { PanelComponent } from './widgets/web/panel/panel.component';
import { PartialDialogComponent } from './widgets/web/dialog/partial-dialog/partial-dialog.component';
import { PartialDirective } from './widgets/web/partial/partial.directive';
import { PictureDirective } from './widgets/web/picture/picture.directive';
import { PrefabDirective } from './widgets/web/prefab/prefab.directive';
import { ProgressBarComponent } from './widgets/web/progress-bar/progress-bar.component';
import { RadiosetComponent } from './widgets/web/radioset/radioset.component';
import { RatingComponent } from './widgets/web/rating/rating.component';
import { RedrawableDirective } from './widgets/web/redraw/redrawable.directive';
import { RichTextEditorComponent } from './widgets/web/rich-text-editor/rich-text-editor.component';
import { RightPanelComponent } from './widgets/web/right-panel/right-panel.component';
import { SafeHtmlDirective } from './directives/safe-html.directive';
import { SafeSrcDirective } from './directives/safe-src.directive';
import { SearchComponent } from './widgets/web/search/search.component';
import { SelectComponent } from './widgets/web/select/select.component';
import { SliderComponent } from './widgets/web/slider/slider.component';
import { SpinnerComponent } from './widgets/web/spinner/spinner.component';
import { SwitchComponent } from './widgets/web/switch/switch.component';
import { TableActionDirective } from './widgets/web/table/table-action/table-action.directive';
import { TableColumnDirective } from './widgets/web/table/table-column/table-column.directive';
import { TableColumnGroupDirective } from './widgets/web/table/table-column-group/table-column-group.directive';
import { TableComponent } from './widgets/web/table/table.component';
import { TableRowActionDirective } from './widgets/web/table/table-row-action/table-row-action.directive';
import { TextareaDirective } from './widgets/web/textarea/textarea.directive';
import { TextDirective } from './widgets/web/text/text.directive';
import { TileDirective } from './widgets/web/tile/tile.directive';
import { TimeComponent } from './widgets/web/time/time.component';
import { TopNavDirective } from './widgets/web/top-nav/top-nav.directive';
import { TreeDirective } from './widgets/web/tree/tree.directive';
import { VideoComponent } from './widgets/web/video/video.component';
import { FilterPipe, NumberToStringPipe, PrefixPipe, StringToNumberPipe, SuffixPipe, TimeFromNowPipe, ToCurrencyPipe, ToDatePipe, ToNumberPipe } from './pipes/custom-pipes';

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
    CompositeComponent,
    ConfirmDialogComponent,
    ContainerDirective,
    ContentComponent,
    CurrencyComponent,
    DateComponent,
    DatetimeComponent,
    DialogActionsComponent,
    DialogComponent,
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
    FormWidgetDirective,
    LabelDirective,
    LayoutGridColumnComponent,
    LayoutgridDirective,
    LayoutGridRowDirective,
    LeftPanelComponent,
    ListComponent,
    ListItemDirective,
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
    PageContentComponent,
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
    RightPanelComponent,
    SafeHtmlDirective,
    SafeSrcDirective,
    SearchComponent,
    SelectComponent,
    SliderComponent,
    SpinnerComponent,
    SwitchComponent,
    TableActionDirective,
    TableColumnDirective,
    TableColumnGroupDirective,
    TableComponent,
    TableRowActionDirective,
    TextareaDirective,
    TextDirective,
    TileDirective,
    TimeComponent,
    TopNavDirective,
    TreeDirective,
    VideoComponent
];

const PIPES = [
    ToDatePipe, FilterPipe,
    ToNumberPipe, ToCurrencyPipe, PrefixPipe,
    SuffixPipe, TimeFromNowPipe, NumberToStringPipe, StringToNumberPipe
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
        ModalModule.forRoot()
    ],
    declarations: [...wmComponents, ...PIPES],
    exports: [...wmComponents, ...PIPES],
    providers: [
        DialogService,
        ToDatePipe,
        FilterPipe
    ],
    entryComponents: [
        MenuComponent,
        MenuDropdownComponent
    ]
})
export class WmComponentsModule {
}
