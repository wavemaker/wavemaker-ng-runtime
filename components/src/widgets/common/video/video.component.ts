import { Component, forwardRef, Injector } from '@angular/core';

import { appendNode, createElement, removeNode } from '@wm/core';

import { WidgetRef } from '../../framework/types';
import { styler } from '../../framework/styler';
import { DISPLAY_TYPE } from '../../framework/constants';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './video.props';
import { SANITIZE_AS, SanitizePipe } from '../../../pipes/sanitize.pipe';

const DEFAULT_CLS = 'app-video';
const WIDGET_CONFIG = {
    widgetType: 'wm-video',
    hostClass: DEFAULT_CLS,
    displayType: DISPLAY_TYPE.INLINE_BLOCK
};

registerProps();

@Component({
    selector: '[wmVideo]',
    templateUrl: './video.component.html',
    providers: [
        {provide: WidgetRef, useExisting: forwardRef(() => VideoComponent)}
    ]
})
export class VideoComponent extends StylableComponent {

    /**
     * subtitle language property eg: en
     */
    public subtitlelang: string = 'en';

    constructor(inj: Injector, private sanitize: SanitizePipe) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);
    }

    // DO NOT use ngIf binding for the track. As of v6.0.Beta7 there is an error creating a void track node
    onPropertyChange(key: string, nv: string) {
        if (key === 'subtitlesource') {
            let track: HTMLElement = this.nativeElement.querySelector('track');
            if (track) {
                removeNode(track, true);
            }

            track = createElement('track', {
                kind: 'subtitles',
                label: this.subtitlelang,
                srclang: this.subtitlelang,
                src: this.sanitize.transform(nv, SANITIZE_AS.RESOURCE),
                default: ''
            }, true);

            appendNode(track, this.nativeElement.querySelector('video'));
        }
    }
}