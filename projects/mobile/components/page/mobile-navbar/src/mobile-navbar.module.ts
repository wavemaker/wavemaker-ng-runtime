import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WmComponentsModule } from '@wm/components/base';
import { SearchModule } from '@wm/components/basic/search';

import { MobileNavbarComponent } from './mobile-navbar.component';

const components = [
    MobileNavbarComponent
];

@NgModule({
    imports: [
        CommonModule,
        SearchModule,
        WmComponentsModule
    ],
    declarations: [...components],
    exports: [...components],
    entryComponents: []
})
export class MobileNavbarModule {
}
