import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WmComponentsModule } from '@wm/components/base';

import { WizardComponent } from './wizard.component';
import { WizardStepDirective} from './wizard-step/wizard-step.directive';

const components = [
    WizardStepDirective,
    WizardComponent
];

@NgModule({
    imports: [
        CommonModule,
        WmComponentsModule
    ],
    declarations: [...components],
    exports: [...components],
    entryComponents: []
})
export class WizardModule {
}
