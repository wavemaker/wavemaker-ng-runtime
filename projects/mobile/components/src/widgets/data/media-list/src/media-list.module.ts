import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WmComponentsModule } from '@wm/components/base';

import { MediaListComponent } from './media-list.component';
import { MediaListItemDirective } from './media-list-item/media-list-item.directive';

const components = [
    MediaListItemDirective,
    MediaListComponent
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
export class MediaListModule {
}
