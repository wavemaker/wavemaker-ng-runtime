import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';

import { WmComponentsModule } from '@wm/components';

import { BarcodeScannerComponent } from './widgets/barcode-scanner/barcode-scanner.component';
import { CameraComponent } from './widgets/camera/camera.component';
import { MediaListComponent } from './widgets/media-list/media-list.component';
import { MediaListItemDirective } from './widgets/media-list/media-list-item/media-list-item.directive';
import { MobileLeftPanelDirective } from './widgets/left-panel/left-panel.directive';
import { MobileNavbarComponent } from './widgets/mobile-navbar/mobile-navbar.component';
import { MobilePageDirective } from './widgets/page/page.directive';
import { SearchDirective } from './widgets/search/search.directive';
import { SegmentContentComponent } from './widgets/segmented-control/segment-content/segment-content.component';
import { SegmentedControlComponent } from './widgets/segmented-control/segmented-control.component';
import { MobileTabbarComponent } from './widgets/tabbar/tabbar.component';
import { WidgetTemplateComponent } from './widgets/widget-template/widget-template.component';

const wmMobileComponents = [
    BarcodeScannerComponent,
    CameraComponent,
    MediaListComponent,
    MediaListItemDirective,
    MobileLeftPanelDirective,
    MobileNavbarComponent,
    MobilePageDirective,
    MobileTabbarComponent,
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
