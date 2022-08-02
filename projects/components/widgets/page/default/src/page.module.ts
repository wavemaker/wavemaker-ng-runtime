import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WmComponentsModule } from '@wm/components/base';

import { PageDirective } from './page.directive';
import { ContentComponent } from './content/content.component';
import { PageContentComponent } from './page-content/page-content.component';
import { SpaPageDirective } from "./spa-page.directive";
import { LayoutDirective } from "./layout.directive";

const components = [
    PageDirective,
    LayoutDirective,
    ContentComponent,
    PageContentComponent,
    SpaPageDirective
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
