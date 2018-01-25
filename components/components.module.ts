import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BsDatepickerModule } from 'ngx-bootstrap';

import { AnchorDirective } from './widgets/anchor/anchor.directive';
import { ButtonDirective } from './widgets/button/button.directive';
import { CalendarComponent } from './widgets/calendar/calendar.component';
import { ContainerDirective } from './widgets/container/container.directive';
import { DateComponent } from './widgets/date/date.component';
import { GridrowDirective } from './widgets/layoutgrid/gridrow/gridrow.directive';
import { GridcolumnDirective } from './widgets/layoutgrid/gridcolumn/gridcolumn.directive';
import { IconDirective } from './widgets/icon/icon.directive';
import { LabelDirective } from './widgets/label/label.directive';
import { LayoutgridDirective } from './widgets/layoutgrid/layoutgrid.directive';
import { PanelComponent } from './widgets/panel/panel.component';
import { RadiosetComponent } from './widgets/radioset/radioset.component';
import { TextDirective } from './widgets/text/text.directive';
import { TextareaDirective } from './widgets/textarea/textarea.directive';
import { TileDirective } from './widgets/tile/tile.directive';



const wmComponents = [
    AnchorDirective,
    ButtonDirective,
    CalendarComponent,
    ContainerDirective,
    DateComponent,
    GridrowDirective,
    GridcolumnDirective,
    IconDirective,
    LabelDirective,
    LayoutgridDirective,
    PanelComponent,
    RadiosetComponent,
    TextDirective,
    TextareaDirective,
    TileDirective
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        BsDatepickerModule.forRoot()
    ],
    declarations: wmComponents,
    exports: wmComponents,
    providers: [],
    entryComponents: []
})
export class WmComponentsModule {
}
