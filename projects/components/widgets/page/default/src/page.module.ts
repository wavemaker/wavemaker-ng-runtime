import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WmComponentsModule } from '@wm/components/base';

import { PageDirective } from './page.directive';
import { ContentComponent } from './content/content.component';
import { PageContentComponent } from './page-content/page-content.component';

const components = [
    PageDirective,
    ContentComponent,
    PageContentComponent
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
