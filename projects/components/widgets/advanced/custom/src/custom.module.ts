import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WmComponentsModule } from '@wm/components/base';

import { CustomDirective } from './custom.directive';
import { CustomPropDirective, CustomPropHandlerDirective} from './custom-prop/custom-prop.directive'
const components = [
    CustomDirective,
    CustomPropDirective,
    CustomPropHandlerDirective
];

@NgModule({
    imports: [
        CommonModule,
        WmComponentsModule
    ],
    declarations: [...components],
    exports: [...components]
})
export class CustomModule {
}
