import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WmComponentsModule } from '@wm/components/base';

import { CustomWidgetDirective } from './custom-widget.directive';
import { CustomWidgetPropDirective, CustomWidgetPropHandlerDirective} from './custom-widget-prop/custom-widget-prop.directive'
const components = [
    CustomWidgetDirective,
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
