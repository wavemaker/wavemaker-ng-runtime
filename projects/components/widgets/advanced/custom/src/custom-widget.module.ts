import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WmComponentsModule } from '@wm/components/base';

import { CustomWidgetContainerDirective } from './custom-widget-container/custom-widget-container.directive';
import { CustomWidgetPropDirective, CustomWidgetPropHandlerDirective} from './custom-widget-container-prop/custom-widget-container-prop.directive'
const components = [
    CustomWidgetContainerDirective,
    CustomWidgetPropDirective,
    CustomWidgetPropHandlerDirective
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
