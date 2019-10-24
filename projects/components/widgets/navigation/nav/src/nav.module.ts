import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WmComponentsModule } from '@wm/components/base';

import { NavigationControlDirective } from './navigation-control.directive';
import { NavComponent } from './nav.component';
import { NavItemDirective } from './nav-item/nav-item.directive';

const components = [
    NavigationControlDirective,
    NavComponent,
    NavItemDirective
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
export class NavModule {
}
