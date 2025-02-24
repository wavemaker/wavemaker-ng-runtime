import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WmComponentsModule } from '@wm/components/base';
import { SearchComponent } from '@wm/components/basic/search';

import { MobileNavbarComponent } from './mobile-navbar.component';

const components = [
    MobileNavbarComponent
];

@NgModule({
    imports: [
        CommonModule,
        SearchComponent,
        WmComponentsModule
    ],
    declarations: [...components],
    exports: [...components]
})
export class MobileNavbarModule {
}
