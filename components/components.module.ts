import { AnchorDirective } from './widgets/anchor/anchor.directive';
import { ButtonDirective } from './widgets/button/button.directive';
import { LabelDirective } from './widgets/label/label.directive';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RadiosetComponent } from '@components/widgets/radioset/radioset.component';
import { LayoutgridComponent } from '@components/widgets/layoutgrid/layoutgrid.component';
import { GridrowComponent } from '@components/widgets/layoutgrid/gridrow/gridrow.component';
import { GridcolumnComponent } from '@components/widgets/layoutgrid/gridcolumn/gridcolumn.component';


const wmComponents = [
    AnchorDirective,
    ButtonDirective,
    LabelDirective,
    RadiosetComponent,
    LayoutgridComponent,
    GridrowComponent,
    GridcolumnComponent
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
