import { AnchorDirective } from './widgets/anchor/anchor.directive';
import { ButtonDirective } from './widgets/button/button.directive';
import { LabelDirective } from './widgets/label/label.directive';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


const wmComponents = [
    AnchorDirective,
    ButtonDirective,
    LabelDirective
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
