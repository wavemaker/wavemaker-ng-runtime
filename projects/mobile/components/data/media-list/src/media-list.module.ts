import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WmComponentsModule } from '@wm/components/base';
import { BasicModule as MobileBasicModule } from '@wm/mobile/components/basic'
import { MobileNavbarModule } from '@wm/mobile/components/page/mobile-navbar';
import { PageContentComponent, PageDirective } from '@wm/components/page';
import { PictureDirective } from '@wm/components/basic';

import { MediaListComponent } from './media-list.component';
import { MediaListItemDirective } from './media-list-item/media-list-item.directive';

const components = [
    MediaListItemDirective,
    MediaListComponent
];

@NgModule({
    imports: [
        PictureDirective,
        CommonModule,
        MobileBasicModule,
        MobileNavbarModule,
        PageContentComponent, PageDirective,
        WmComponentsModule
    ],
    declarations: [...components],
    exports: [...components]
})
export class MediaListModule {
}
