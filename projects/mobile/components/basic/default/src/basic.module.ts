import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WmComponentsModule } from '@wm/components/base';

import { AnchorDirective } from './anchor/anchor.directive';
import { AppUpdateComponent } from './app-update/app-update.component';
import { FileBrowserComponent } from './file-browser/file-browser.component';
import { ImageCacheDirective } from './image-cache/image-cache.directive';
import { NetworkInfoToasterComponent } from './network-info-toaster/network-info-toaster.component';
import { ProcessManagerComponent } from './process-manager/process-manager.component';

const components = [
    AnchorDirective, 
    AppUpdateComponent,
    FileBrowserComponent,
    ImageCacheDirective,
    NetworkInfoToasterComponent,
    ProcessManagerComponent
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
export class BasicModule {
}
