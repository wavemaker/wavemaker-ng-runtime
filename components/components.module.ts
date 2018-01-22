import { AnchorDirective } from './widgets/anchor/anchor.directive';
import { ButtonDirective } from './widgets/button/button.directive';
import { LabelDirective } from './widgets/label/label.directive';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RadiosetComponent } from './widgets/radioset/radioset.component';
import { TextDirective } from './widgets/text/text.directive';
import { TextareaDirective } from './widgets/textarea/textarea.directive';
import { LayoutgridDirective } from './widgets/layoutgrid/layoutgrid.directive';
import { GridrowDirective } from './widgets/layoutgrid/gridrow/gridrow.directive';
import { GridcolumnDirective } from './widgets/layoutgrid/gridcolumn/gridcolumn.directive';


const wmComponents = [
    AnchorDirective,
    ButtonDirective,
    LabelDirective,
    TextDirective,
    TextareaDirective,
    RadiosetComponent,
    LayoutgridDirective,
    GridrowDirective,
    GridcolumnDirective
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule
    ],
    declarations: wmComponents,
    exports: wmComponents,
    providers: [],
    entryComponents: []
})
export class WmComponentsModule {
}
