import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WmComponentsModule } from '@wm/components';

import { AnchorDirective } from './widgets/anchor/anchor.directive';
import { AppUpdateComponent } from './widgets/app-update/app-update.component';
import { BarcodeScannerComponent } from './widgets/barcode-scanner/barcode-scanner.component';
import { CameraComponent } from './widgets/camera/camera.component';
import { DateDirective } from './widgets/date/date.directive';
import { DateTimeDirective } from './widgets/date-time/date-time.directive';
import { FileBrowserComponent } from './widgets/file-browser/file-browser.component';
import { FileUploadDirective } from './widgets/file-upload/file-upload.directive';
import { ImageCacheDirective } from './widgets/image-cache/image-cache.directive';
import { MediaListComponent } from './widgets/media-list/media-list.component';
import { MediaListItemDirective } from './widgets/media-list/media-list-item/media-list-item.directive';
import { MobileLeftPanelDirective } from './widgets/left-panel/left-panel.directive';
import { MobilePageDirective } from './widgets/page/page.directive';
import { MobileNavbarComponent } from './widgets/mobile-navbar/mobile-navbar.component';
import { NetworkInfoToasterComponent } from './widgets/network-info-toaster/network-info-toaster.component';
import { PageContentLoaderComponent } from './widgets/page-content-loader/page-content-loader.component';
import { ProcessManagerComponent } from './widgets/process-manager/process-manager.component';
import { SearchDirective } from './widgets/search/search.directive';
import { SegmentContentComponent } from './widgets/segmented-control/segment-content/segment-content.component';
import { SegmentedControlComponent } from './widgets/segmented-control/segmented-control.component';
import { TimeDirective } from './widgets/time/time.directive';
import { MobileTabbarComponent } from './widgets/tabbar/tabbar.component';
import { WidgetTemplateComponent } from './widgets/widget-template/widget-template.component';

const wmMobileComponents = [
    AnchorDirective,
    AppUpdateComponent,
    BarcodeScannerComponent,
    CameraComponent,
    DateDirective,
    DateTimeDirective,
    FileBrowserComponent,
    FileUploadDirective,
    ImageCacheDirective,
    MediaListComponent,
    MediaListItemDirective,
    MobileLeftPanelDirective,
    MobileNavbarComponent,
    MobilePageDirective,
    MobileTabbarComponent,
    NetworkInfoToasterComponent,
    PageContentLoaderComponent,
    ProcessManagerComponent,
    SearchDirective,
    SegmentContentComponent,
    SegmentedControlComponent,
    TimeDirective,
    WidgetTemplateComponent
];

const PIPES = [];

@NgModule({
    imports: [
        CommonModule,
        WmComponentsModule
    ],
    declarations: [...wmMobileComponents, ...PIPES],
    exports: [...wmMobileComponents, ...PIPES],
    providers: [
        // add providers to mobile-runtime module.
    ],
    entryComponents: []
})
export class WmMobileComponentsModule {
}
