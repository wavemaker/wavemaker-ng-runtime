import { Component, Injector, SecurityContext } from '@angular/core';

import { appendNode, createElement, removeNode } from '@wm/core';
import { DISPLAY_TYPE, IWidgetConfig, provideAsWidgetRef, StylableComponent, styler, TrustAsPipe } from '@wm/components/base';

import { registerProps } from './video.props';

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
    ]
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

    constructor(inj: Injector, private trustAsPipe: TrustAsPipe) {
        super(inj, WIDGET_CONFIG);
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
        }

        super.onPropertyChange(key, nv, ov);
    }
}
