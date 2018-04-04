import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BsDatepickerModule, BsDropdownModule, TimepickerModule, ProgressbarModule, TypeaheadModule, ModalModule } from 'ngx-bootstrap';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ColorPickerModule } from 'ngx-color-picker';
import { DialogService } from './widgets/dialog/dialog.service';

import { AccordionDirective } from './widgets/accordion/accordion.component';
import { AccordionPaneComponent } from './widgets/accordion/accordion-pane/accordion-pane.component';
import { AlertDialogComponent } from './widgets/dialog/alert-dialog/alert-dialog.component';
import { AnchorComponent } from './widgets/anchor/anchor.component';
import { AudioComponent } from './widgets/audio/audio.component';
import { ButtonComponent } from './widgets/button/button.component';
import { ButtonGroupDirective } from './widgets/button-group/button-group.directive';
import { CalendarComponent } from './widgets/calendar/calendar.component';
import { CheckboxComponent } from './widgets/checkbox/checkbox.component';
import { ColorPickerComponent } from './widgets/color-picker/color-picker.component';
import { ConfirmDialogComponent } from './widgets/dialog/confirm-dialog/confirm-dialog.component';
import { ContainerDirective } from './widgets/container/container.directive';
import { ContentComponent } from './widgets/content/content.component';
import { CurrencyComponent } from './widgets/currency/currency.component';
import { DateComponent } from './widgets/date/date.component';
import { DatetimeComponent } from './widgets/date-time/date-time.component';
import { DialogActionsComponent } from './widgets/dialog/dialog-actions/dialog-actions.component';
import { DialogComponent } from './widgets/dialog/dialog.component';
import { DialogHeaderComponent } from './widgets/dialog/dialog-header/dialog-header.component';
import { FooterDirective } from './widgets/footer/footer.directive';
import { FormActionDirective} from './widgets/form/form-action/form-action.directive';
import { FormComponent } from './widgets/form/form.component';
import { FormFieldDirective } from './widgets/form-field/form-field.directive';
import { HeaderComponent } from './widgets/header/header.component';
import { HtmlDirective } from './widgets/html/html.directive';
import { IconComponent } from './widgets/icon/icon.component';
import { IframeComponent } from './widgets/iframe/iframe.component';
import { IframeDialogComponent } from './widgets/dialog/iframe-dialog/iframe-dialog.component';
import { LabelDirective } from './widgets/label/label.directive';
import { LayoutGridColumnComponent } from './widgets/layout-grid/layout-grid-column/layout-grid-column.component';
import { LayoutgridDirective } from './widgets/layout-grid/layout-grid.directive';
import { LayoutGridRowDirective } from './widgets/layout-grid/layout-grid-row/layout-grid-row.directive';
import { LeftPanelComponent } from './widgets/left-panel/left-panel.component';
import { ListComponent } from './widgets/list/list.component';
import { ListItemDirective } from './widgets/list/list-item.directive';
import { LiveFormDirective } from './widgets/form/live-form.directive';
import { LiveTableComponent } from './widgets/live-table/live-table.component';
import { LoginComponent } from './widgets/login/login.component';
import { MenuComponent } from './widgets/menu/menu.component';
import { MenuDropdownComponent } from './widgets/menu/menu-dropdown.component';
import { MenuDropdownItemComponent } from './widgets/menu/menu-dropdown-item.component';
import { MessageComponent } from './widgets/message/message.component';
import { NavbarComponent } from './widgets/navbar/navbar.component';
import { NavDirective } from './widgets/nav/nav.directive';
import { NavItemDirective } from './widgets/nav-item/nav-item.directive';
import { PageContentComponent } from './widgets/page-content/page-content.component';
import { PageDirective } from './widgets/page/page.directive';
import { PaginationComponent } from './widgets/pagination/pagination.component';
import { PanelComponent } from './widgets/panel/panel.component';
import { PartialDialogComponent } from './widgets/dialog/partial-dialog/partial-dialog.component';
import { PartialDirective } from './widgets/partial/partial.directive';
import { PictureDirective } from './widgets/picture/picture.directive';
import { PrefabDirective } from './widgets/prefab/prefab.directive';
import { ProgressBarComponent } from './widgets/progress-bar/progress-bar.component';
import { RadiosetComponent } from './widgets/radioset/radioset.component';
import { RatingComponent } from './widgets/rating/rating.component';
import { RightPanelComponent } from './widgets/right-panel/right-panel.component';
import { SearchComponent } from './widgets/search/search.component';
import { SelectComponent } from './widgets/select/select.component';
import { SliderComponent } from './widgets/slider/slider.component';
import { SpinnerComponent } from './widgets/spinner/spinner.component';
import { SwitchComponent } from './widgets/switch/switch.component';
import { TableActionDirective } from './widgets/table/table-action/table-action.directive';
import { TableColumnDirective } from './widgets/table/table-column/table-column.directive';
import { TableColumnGroupDirective } from './widgets/table/table-column-group/table-column-group.directive';
import { TableComponent } from './widgets/table/table.component';
import { TableRowActionDirective } from './widgets/table/table-row-action/table-row-action.directive';
import { TextareaDirective } from './widgets/textarea/textarea.directive';
import { TextDirective } from './widgets/text/text.directive';
import { TileDirective } from './widgets/tile/tile.directive';
import { TimeComponent } from './widgets/time/time.component';
import { TopNavDirective } from './widgets/top-nav/top-nav.directive';
import { TreeDirective } from './widgets/tree/tree.directive';
import { VideoComponent } from './widgets/video/video.component';
import { NumberToStringPipe, PrefixPipe, StringToNumberPipe, SuffixPipe, TimeFromNowPipe, ToCurrencyPipe, ToDatePipe, ToNumberPipe } from './pipes/custom-pipes';

const wmComponents = [
    AccordionDirective,
    AccordionPaneComponent,
    AlertDialogComponent,
    AnchorComponent,
    AudioComponent,
    ButtonComponent,
    ButtonGroupDirective,
    CalendarComponent,
    CheckboxComponent,
    ColorPickerComponent,
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
    RightPanelComponent,
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
    ToDatePipe,
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
        ToDatePipe
    ],
    entryComponents: [
        MenuComponent,
        MenuDropdownComponent
    ]
})
export class WmComponentsModule {
}
