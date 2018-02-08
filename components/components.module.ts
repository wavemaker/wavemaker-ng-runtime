import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BsDatepickerModule, BsDropdownModule, TimepickerModule } from 'ngx-bootstrap';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ColorPickerModule } from 'ngx-color-picker';

import { widgetsByName } from './utils/init-widget';

import { AnchorDirective } from './widgets/anchor/anchor.directive';
import { AudioComponent } from './widgets/audio/audio.component';
import { ButtonDirective } from './widgets/button/button.directive';
import { ButtonGroupDirective } from './widgets/buttongroup/buttongroup.directive';
import { CalendarComponent } from './widgets/calendar/calendar.component';
import { CheckboxComponent } from './widgets/checkbox/checkbox.component';
import { ColorpickerComponent } from './widgets/colorpicker/colorpicker.component';
import { ContainerDirective } from './widgets/container/container.directive';
import { CurrencyComponent } from './widgets/currency/currency.component';
import { DateComponent } from './widgets/date/date.component';
import { DatetimeComponent } from './widgets/datetime/datetime.component';
import { FooterDirective } from './widgets/footer/footer.directive';
import { GridrowDirective } from './widgets/layoutgrid/gridrow/gridrow.directive';
import { GridcolumnDirective } from './widgets/layoutgrid/gridcolumn/gridcolumn.directive';
import { HeaderDirective } from './widgets/header/header.directive';
import { HtmlDirective } from './widgets/html/html.directive';
import { IconDirective } from './widgets/icon/icon.directive';
import { IframeComponent } from './widgets/iframe/iframe.component';
import { LabelDirective } from './widgets/label/label.directive';
import { LayoutgridDirective } from './widgets/layoutgrid/layoutgrid.directive';
import { MessageComponent } from './widgets/message/message.component';
import { NavDirective } from './widgets/nav/nav.directive';
import { NavItemDirective } from './widgets/nav-item/nav-item.directive';
import { NavbarComponent } from './widgets/navbar/navbar.component';
import { PageDirective } from './widgets/page/page.directive';
import { PartialDirective } from './widgets/partial/partial.directive';
import { PanelComponent } from './widgets/panel/panel.component';
import { PictureDirective } from './widgets/picture/picture.directive';
import { RadiosetComponent } from './widgets/radioset/radioset.component';
import { RatingComponent } from './widgets/rating/rating.component';
import { SelectComponent } from './widgets/select/select.component';
import { SliderComponent } from './widgets/slider/slider.component';
import { SpinnerComponent } from './widgets/spinner/spinner.component';
import { TextDirective } from './widgets/text/text.directive';
import { TextareaDirective } from './widgets/textarea/textarea.directive';
import { TileDirective } from './widgets/tile/tile.directive';
import { TimeComponent } from './widgets/time/time.component';
import { TopNavDirective } from './widgets/top-nav/top-nav.directive';
import { VideoComponent } from './widgets/video/video.component';
import { PaginationComponent } from './widgets/pagination/pagination.component';
import { TableComponent } from './widgets/table/table.component';
import { TableColumnComponent } from './widgets/table/table-column.component';
import { TableColumnGroupComponent } from './widgets/table/table-column-group.component';
import { TableActionComponent } from './widgets/table/table-action.component';
import { TableRowActionComponent } from './widgets/table/table-row-action.component';

const wmComponents = [
    AnchorDirective,
    AudioComponent,
    ButtonDirective,
    ButtonGroupDirective,
    CalendarComponent,
    CheckboxComponent,
    ColorpickerComponent,
    ContainerDirective,
    CurrencyComponent,
    DateComponent,
    DatetimeComponent,
    FooterDirective,
    GridrowDirective,
    GridcolumnDirective,
    HeaderDirective,
    HtmlDirective,
    IconDirective,
    IframeComponent,
    LabelDirective,
    LayoutgridDirective,
    MessageComponent,
    NavDirective,
    NavItemDirective,
    NavbarComponent,
    PageDirective,
    PartialDirective,
    PanelComponent,
    PictureDirective,
    RadiosetComponent,
    RatingComponent,
    SelectComponent,
    SliderComponent,
    SpinnerComponent,
    TextDirective,
    TextareaDirective,
    TileDirective,
    TimeComponent,
    TopNavDirective,
    VideoComponent,
    PaginationComponent,
    TableComponent,
    TableColumnComponent,
    TableColumnGroupComponent,
    TableActionComponent,
    TableRowActionComponent
];

@NgModule({
    imports: [
        ColorPickerModule,
        CommonModule,
        FormsModule,
        BsDatepickerModule.forRoot(),
        TimepickerModule.forRoot(),
        BsDropdownModule.forRoot(),
        PaginationModule.forRoot()
    ],
    declarations: wmComponents,
    exports: wmComponents,
    providers: [],
    entryComponents: []
})
export class WmComponentsModule {
}

export { widgetsByName as PageWidgets } ;