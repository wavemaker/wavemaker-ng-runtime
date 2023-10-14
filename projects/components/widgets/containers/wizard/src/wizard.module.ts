import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
        WmComponentsModule,
        FormsModule
    ],
    declarations: [...components],
    exports: [...components]
})
export class WizardModule {
}
