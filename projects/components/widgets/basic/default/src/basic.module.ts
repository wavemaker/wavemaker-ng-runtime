import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WmComponentsModule } from '@wm/components/base';

import { AnchorComponent } from './anchor/anchor.component';
import { AudioComponent } from './audio/audio.component';
import { HtmlDirective } from './html/html.directive';
import { IconComponent } from './icon/icon.component';
import { IframeComponent } from './iframe/iframe.component';
import { LabelDirective } from './label/label.directive';
import { PictureDirective } from './picture/picture.directive';
import { SpinnerComponent } from './spinner/spinner.component';
import { VideoComponent } from './video/video.component';

const components = [
    AnchorComponent,
    AudioComponent,
    HtmlDirective,
    IconComponent,
    IframeComponent,
    LabelDirective,
    PictureDirective,
    SpinnerComponent,
    VideoComponent
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
