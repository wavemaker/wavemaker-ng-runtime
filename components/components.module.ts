import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BsDatepickerModule, BsDropdownModule, TimepickerModule, TypeaheadModule } from 'ngx-bootstrap';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ColorPickerModule } from 'ngx-color-picker';

import { widgetsByName } from './utils/init-widget';

import { AnchorComponent } from './widgets/anchor/anchor.component';
import { AudioComponent } from './widgets/audio/audio.component';
import { ButtonDirective } from './widgets/button/button.component';
import { ButtonGroupDirective } from './widgets/button-group/button-group.directive';
import { CalendarComponent } from './widgets/calendar/calendar.component';
import { CheckboxComponent } from './widgets/checkbox/checkbox.component';
import { ColorPickerComponent } from './widgets/color-picker/color-picker.component';
import { ContainerDirective } from './widgets/container/container.directive';
import { ContentComponent } from './widgets/content/content.component';
import { CurrencyComponent } from './widgets/currency/currency.component';
import { DateComponent } from './widgets/date/date.component';
import { DatetimeComponent } from './widgets/date-time/date-time.component';
import { FooterDirective } from './widgets/footer/footer.directive';
import { LayoutGridRowDirective } from './widgets/layout-grid/layout-grid-row/layout-grid-row.directive';
import { LayoutGridColumnComponent } from './widgets/layout-grid/layout-grid-column/layout-grid-column.component';
import { HeaderComponent } from './widgets/header/header.component';
import { HtmlDirective } from './widgets/html/html.directive';
import { IconDirective } from './widgets/icon/icon.component';
import { IframeComponent } from './widgets/iframe/iframe.component';
import { LabelDirective } from './widgets/label/label.directive';
import { LayoutgridDirective } from './widgets/layout-grid/layout-grid.directive';
import { LeftPanelComponent } from './widgets/left-panel/left-panel.component';
import { MessageComponent } from './widgets/message/message.component';
import { NavDirective } from './widgets/nav/nav.directive';
import { NavItemDirective } from './widgets/nav-item/nav-item.directive';
import { NavbarComponent } from './widgets/navbar/navbar.component';
import { PageDirective } from './widgets/page/page.directive';
import { PageContentDirective } from './widgets/page-content/page-content.component';
import { PartialDirective } from './widgets/partial/partial.directive';
import { PanelComponent } from './widgets/panel/panel.component';
import { PictureDirective } from './widgets/picture/picture.directive';
import { RadiosetComponent } from './widgets/radioset/radioset.component';
import { RatingComponent } from './widgets/rating/rating.component';
import { RightPanelComponent } from './widgets/right-panel/right-panel.component';
import { SearchComponent } from './widgets/search/search.component';
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
import { TableColumnDirective } from './widgets/table/table-column/table-column.directive';
import { TableColumnGroupDirective } from './widgets/table/table-column-group/table-column-group.directive';
import { TableActionDirective } from './widgets/table/table-action/table-action.directive';
import { TableRowActionDirective } from './widgets/table/table-row-action/table-row-action.directive';

const wmComponents = [
    AnchorComponent,
    AudioComponent,
    ButtonDirective,
    ButtonGroupDirective,
    CalendarComponent,
    CheckboxComponent,
    ColorPickerComponent ,
    ContainerDirective,
    ContentComponent,
    CurrencyComponent,
    DateComponent,
    DatetimeComponent,
    FooterDirective,
    LayoutGridRowDirective,
    LayoutGridColumnComponent,
    HeaderComponent,
    HtmlDirective,
    IconDirective,
    IframeComponent,
    LabelDirective,
    LayoutgridDirective,
    LeftPanelComponent,
    MessageComponent,
    NavDirective,
    NavItemDirective,
    NavbarComponent,
    PageDirective,
    PageContentDirective,
    PartialDirective,
    PanelComponent,
    PictureDirective,
    RadiosetComponent,
    RatingComponent,
    RightPanelComponent,
    SearchComponent,
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
    TableColumnDirective,
    TableColumnGroupDirective,
    TableActionDirective,
    TableRowActionDirective
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
        TypeaheadModule.forRoot()
    ],
    declarations: wmComponents,
    exports: wmComponents,
    providers: [],
    entryComponents: []
})
export class WmComponentsModule {
}

export { widgetsByName as PageWidgets } ;