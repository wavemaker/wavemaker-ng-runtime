import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WmComponentsModule } from '@wm/components/base';

import { CustomWidgetContainerDirective } from './custom-widget-container/custom-widget-container.directive';
import { CustomWidgetDirective } from './custom-widget.directive'
const components = [
    CustomWidgetContainerDirective,
    CustomWidgetDirective
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
