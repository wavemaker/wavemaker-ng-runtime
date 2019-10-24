import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WmComponentsModule } from '@wm/components/base';
import { NavModule } from '@wm/components/navigation/nav'

import { BreadcrumbComponent } from './breadcrumb.component';

const components = [
    BreadcrumbComponent
];

@NgModule({
    imports: [
        CommonModule,
        NavModule,
        WmComponentsModule
    ],
    declarations: [...components],
    exports: [...components],
    entryComponents: []
})
export class BreadcrumbModule {
}
