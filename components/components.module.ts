import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AnchorDirective } from './widgets/anchor/anchor.directive';
import { BsDatepickerModule } from 'ngx-bootstrap';
import { ButtonDirective } from './widgets/button/button.directive';
import { DateComponent } from './widgets/date/date.component';
import { GridcolumnDirective } from './widgets/layoutgrid/gridcolumn/gridcolumn.directive';
import { GridrowDirective } from './widgets/layoutgrid/gridrow/gridrow.directive';
import { LabelDirective } from './widgets/label/label.directive';
import { LayoutgridDirective } from './widgets/layoutgrid/layoutgrid.directive';
import { PanelComponent } from './widgets/panel/panel.component';
import { PanelFooterDirective } from './widgets/panel/panel-footer/panel-footer.component';
import { RadiosetComponent } from './widgets/radioset/radioset.component';
import { TextareaDirective } from './widgets/textarea/textarea.directive';
import { TextDirective } from './widgets/text/text.directive';


const wmComponents = [
    AnchorDirective,
    ButtonDirective,
    DateComponent,
    GridcolumnDirective,
    GridrowDirective,
    LabelDirective,
    LayoutgridDirective,
    PanelComponent,
    PanelFooterDirective,
    RadiosetComponent,
    TextareaDirective,
    TextDirective
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
