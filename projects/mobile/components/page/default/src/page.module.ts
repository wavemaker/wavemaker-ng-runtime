import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WmComponentsModule } from '@wm/components/base';

import { MobilePageDirective } from './page.directive';
import { PageContentLoaderComponent } from './page-content-loader/page-content-loader.component';

const components = [
    MobilePageDirective,
    PageContentLoaderComponent
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
export class PageModule {
}
