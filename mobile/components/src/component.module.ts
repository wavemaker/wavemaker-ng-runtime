import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';

import { WmComponentsModule } from '@wm/components';

import { AppUpdateComponent } from './widgets/app-update/app-update.component';
import { BarcodeScannerComponent } from './widgets/barcode-scanner/barcode-scanner.component';
import { CameraComponent } from './widgets/camera/camera.component';
import { DateDirective } from './widgets/date/date.directive';
import { DateTimeDirective } from './widgets/date-time/date-time.directive';
import { ImageCacheDirective } from './widgets/image-cache/image-cache.directive';
import { MediaListComponent } from './widgets/media-list/media-list.component';
import { MediaListItemDirective } from './widgets/media-list/media-list-item/media-list-item.directive';
import { MobileLeftPanelDirective } from './widgets/left-panel/left-panel.directive';
import { MobileNavbarComponent } from './widgets/mobile-navbar/mobile-navbar.component';
import { NetworkInfoToasterComponent } from './widgets/network-info-toaster/network-info-toaster.component';
import { MobilePageDirective } from './widgets/page/page.directive';
import { SearchDirective } from './widgets/search/search.directive';
import { SegmentContentComponent } from './widgets/segmented-control/segment-content/segment-content.component';
import { SegmentedControlComponent } from './widgets/segmented-control/segmented-control.component';
import { MobileTabbarComponent } from './widgets/tabbar/tabbar.component';
import { WidgetTemplateComponent } from './widgets/widget-template/widget-template.component';

const wmMobileComponents = [
    AppUpdateComponent,
    BarcodeScannerComponent,
    CameraComponent,
    DateDirective,
    DateTimeDirective,
    ImageCacheDirective,
    MediaListComponent,
    MediaListItemDirective,
    MobileLeftPanelDirective,
    MobileNavbarComponent,
    MobilePageDirective,
    MobileTabbarComponent,
    NetworkInfoToasterComponent,
    SearchDirective,
    SegmentContentComponent,
    SegmentedControlComponent,
    WidgetTemplateComponent
];

const PIPES = [];

@NgModule({
    imports: [
        BrowserModule,
        CommonModule,
        WmComponentsModule
    ],
    declarations: [...wmMobileComponents, ...PIPES],
    exports: [...wmMobileComponents, ...PIPES],
    providers: [],
    entryComponents: []
})
export class WmMobileComponentsModule {
}
