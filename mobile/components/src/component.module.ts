import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';

import { WmComponentsModule } from '@wm/components';

import { CameraComponent } from './widgets/camera/camera.component';
import { MobileLeftPanelDirective } from './widgets/left-panel/left-panel.directive';
import { MobileNavbarComponent } from './widgets/mobile-navbar/mobile-navbar.component';
import { MobilePageDirective } from './widgets/page/page.directive';
import { SearchDirective } from './widgets/search/search.directive';
import { MobileTabbarComponent } from './widgets/tabbar/tabbar.component';
import { WidgetTemplateComponent } from './widgets/widget-template/widget-template.component';

const wmMobileComponents = [
    CameraComponent,
    MobileLeftPanelDirective,
    MobileNavbarComponent,
    MobilePageDirective,
    MobileTabbarComponent,
    SearchDirective,
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
