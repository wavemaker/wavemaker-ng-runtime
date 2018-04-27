import { NgModule } from '@angular/core';

import { WidgetTemplateComponent } from './widgets/widget-template/widget-template.component';

const wmMobileComponents = [
    WidgetTemplateComponent
];

const PIPES = [];

@NgModule({
    imports: [],
    declarations: [...wmMobileComponents, ...PIPES],
    exports: [...wmMobileComponents, ...PIPES],
    providers: [],
    entryComponents: []
})
export class WmMobileComponentsModule {
}
