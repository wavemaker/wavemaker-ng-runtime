import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WmComponentsModule } from '@wm/components/base';

import { PageDirective } from './page.directive';
import { ContentComponent } from './content/content.component';
import { PageContentComponent } from './page-content/page-content.component';
import { SpaPageDirective } from "./spa-page.directive";
import { LayoutDirective } from "./layout.directive";
import { RouterOutletDirective } from "./router-outlet.directive";

const components = [
    PageDirective,
    LayoutDirective,
    ContentComponent,
    PageContentComponent,
    SpaPageDirective,
    RouterOutletDirective
];

@NgModule({
    imports: [
        CommonModule,
        WmComponentsModule
    ],
    declarations: [...components],
    exports: [...components],
    providers: [
        PageDirective,
        SpaPageDirective
    ]
})
export class PageModule {
}
