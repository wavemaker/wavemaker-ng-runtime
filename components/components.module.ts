import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BsDatepickerModule, BsDropdownModule, TimepickerModule } from 'ngx-bootstrap';
import { ColorPickerModule } from 'ngx-color-picker';

import { AnchorDirective } from './widgets/anchor/anchor.directive';
import { ButtonDirective } from './widgets/button/button.directive';
import { ButtonGroupDirective } from './widgets/buttongroup/buttongroup.directive';
import { CalendarComponent } from './widgets/calendar/calendar.component';
import { CheckboxComponent } from './widgets/checkbox/checkbox.component';
import { ColorpickerComponent } from './widgets/colorpicker/colorpicker.component';
import { ContainerDirective } from './widgets/container/container.directive';
import { CurrencyComponent } from './widgets/currency/currency.component';
import { DateComponent } from './widgets/date/date.component';
import { DatetimeComponent } from './widgets/datetime/datetime.component';
import { GridrowDirective } from './widgets/layoutgrid/gridrow/gridrow.directive';
import { GridcolumnDirective } from './widgets/layoutgrid/gridcolumn/gridcolumn.directive';
import { IconDirective } from './widgets/icon/icon.directive';
import { LabelDirective } from './widgets/label/label.directive';
import { LayoutgridDirective } from './widgets/layoutgrid/layoutgrid.directive';
import { PanelComponent } from './widgets/panel/panel.component';
import { RadiosetComponent } from './widgets/radioset/radioset.component';
import { SelectComponent } from './widgets/select/select.component';
import { TextDirective } from './widgets/text/text.directive';
import { TextareaDirective } from './widgets/textarea/textarea.directive';
import { TileDirective } from './widgets/tile/tile.directive';
import { TimeComponent } from './widgets/time/time.component';



const wmComponents = [
    AnchorDirective,
    ButtonDirective,
    ButtonGroupDirective,
    CalendarComponent,
    CheckboxComponent,
    ColorpickerComponent,
    ContainerDirective,
    CurrencyComponent,
    DateComponent,
    DatetimeComponent,
    GridrowDirective,
    GridcolumnDirective,
    IconDirective,
    LabelDirective,
    LayoutgridDirective,
    PanelComponent,
    RadiosetComponent,
    SelectComponent,
    TextDirective,
    TextareaDirective,
    TileDirective,
    TimeComponent
];

@NgModule({
    imports: [
        ColorPickerModule,
        CommonModule,
        FormsModule,
        BsDatepickerModule.forRoot(),
        TimepickerModule.forRoot(),
        BsDropdownModule.forRoot()
    ],
    declarations: wmComponents,
    exports: wmComponents,
    providers: [],
    entryComponents: []
})
export class WmComponentsModule {
}
