import { Component, Inject, Injector, Optional, SecurityContext } from '@angular/core';

import { appendNode, createElement, removeNode, transformFileURI } from '@wm/core';
import { DISPLAY_TYPE, provideAsWidgetRef, StylableComponent, styler, TrustAsPipe, WmComponentsModule } from '@wm/components/base';

import { registerProps } from './video.props';
import { CommonModule } from '@angular/common';

const DEFAULT_CLS = 'app-video';
const WIDGET_CONFIG = {
    widgetType: 'wm-video',
    hostClass: DEFAULT_CLS,
    displayType: DISPLAY_TYPE.INLINE_BLOCK
};

@Component({
    selector: '[wmVideo]',
    templateUrl: './video.component.html',
    providers: [
        provideAsWidgetRef(VideoComponent)
    ],
    standalone: true,
    imports: [CommonModule, WmComponentsModule]
})
export class VideoComponent extends StylableComponent {
    static initializeProps = registerProps();
    /**
     * subtitle language property eg: en
     */
    public subtitlelang = 'en';
    public videopreload: any;
    public mp4format: string;
    public muted: boolean;
    public videoposter: any;
    public controls: boolean;
    public loop: boolean;
    public autoplay: boolean;
    public webmformat: string;
    public oggformat: string;
    public videosupportmessage: any;
    public arialabel: string;
    public tabindex: string;

    constructor(inj: Injector, private trustAsPipe: TrustAsPipe, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
        super(inj, WIDGET_CONFIG, explicitContext);
        styler(this.nativeElement, this);
    }

    // DO NOT use ngIf binding for the track. As of v6.0.Beta7 there is an error creating a void track node
    onPropertyChange(key: string, nv: any, ov?: any) {
        if (key === 'subtitlesource') {
            let track: HTMLElement = this.nativeElement.querySelector('track');
            if (track) {
                removeNode(track, true);
            }

            track = createElement('track', {
                kind: 'subtitles',
                label: this.subtitlelang,
                srclang: this.subtitlelang,
                src: this.trustAsPipe.transform(nv, SecurityContext.RESOURCE_URL),
                default: ''
            }, true);

            appendNode(track, this.nativeElement.querySelector('video'));
        } else if (key === 'mp4format') {
            this.mp4format = transformFileURI(nv);
        } else if (key === 'webmformat') {
            this.webmformat = transformFileURI(nv);
        } else if (key === 'oggformat') {
            this.oggformat = transformFileURI(nv);
        } else if (key === 'tabindex') {
            return;
        }

        super.onPropertyChange(key, nv, ov);
    }
}
