import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';


import { BasicModule } from '@wm/mobile/components/basic';
import { SearchModule } from '@wm/mobile/components/basic/search';

import { SegmentedControlModule } from '@wm/mobile/components/containers/segmented-control';

import { MediaListModule } from '@wm/mobile/components/data/media-list';

import { BarcodeScannerModule } from '@wm/mobile/components/device/barcode-scanner';
import { CameraModule } from '@wm/mobile/components/device/camera';

import { FileUploadModule } from '@wm/mobile/components/input/file-upload';

import { PageModule } from '@wm/mobile/components/page';
import { LeftPanelModule } from '@wm/mobile/components/page/left-panel';
import { MobileNavbarModule } from '@wm/mobile/components/page/mobile-navbar';
import { TabBarModule } from '@wm/mobile/components/page/tab-bar';
import { LiveSyncInterceptor } from './services/live-sync.service';

export const MOBILE_COMPONENT_MODULES_FOR_ROOT = [
    BasicModule,
    SearchModule,
    SegmentedControlModule,
    MediaListModule,
    BarcodeScannerModule,
    CameraModule,
    FileUploadModule,
    PageModule,
    LeftPanelModule,
    MobileNavbarModule,
    TabBarModule
];

@NgModule({
    providers: [{
        provide: HTTP_INTERCEPTORS,
        useClass: LiveSyncInterceptor,
        multi: true
    }]
})
export class MobileRuntimeDynamicModule {}
