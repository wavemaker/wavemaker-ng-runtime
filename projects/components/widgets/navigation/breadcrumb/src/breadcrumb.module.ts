import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WmComponentsModule } from '@wm/components/base';
import { MenuModule } from '@wm/components/navigation/menu'

import { BreadcrumbComponent } from './breadcrumb.component';

const components = [
    BreadcrumbComponent
];

@NgModule({
    imports: [
        CommonModule,
        MenuModule,
        WmComponentsModule
    ],
    declarations: [...components],
    exports: [...components],
    entryComponents: []
})
export class BreadcrumbModule {
}
