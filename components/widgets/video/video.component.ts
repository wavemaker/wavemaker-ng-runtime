import { Component, Injector, ElementRef, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { registerProps } from './video.props';
import { styler } from '../../utils/styler';
import { removeAttr, setAttr } from '@utils/dom';
import { getImageUrl, getResourceURL } from '@utils/utils';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { html, render } from 'lit-html/lit-html';


const DEFAULT_CLS = 'app-video';
const WIDGET_CONFIG = {widgetType: 'wm-video', hostClass: DEFAULT_CLS};

const getTrack = (subtitleLang, trackSource) => {
    return html`<track kind="subtitles" label="${subtitleLang}" src="${trackSource}" srclang="${subtitleLang}" default>`;
};

registerProps();

@Component({
    selector: '[wmVideo]',
    templateUrl: './video.component.html'
})
export class VideoComponent extends BaseComponent {

    mp4videoUrl: SafeResourceUrl = '';
    webmvideoUrl: SafeResourceUrl = '';
    oggvideoUrl: SafeResourceUrl = '';
    videoposter;
    subtitlelang;

    isValidResource(value) {
        return value && typeof value === 'string' && value.indexOf('Variables') === -1;
    }

    onPropertyChange(key, newVal, oldVal) {
        switch (key) {
            case 'videoposter':
                const $video = this.$element.querySelector('video');
                if (!newVal) {
                    removeAttr($video, 'poster');
                } else {
                    setAttr($video, 'poster', getImageUrl(newVal));
                }
                break;
            case 'mp4format':
                if (this.isValidResource(newVal)) {
                    this.mp4videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(newVal);
                }
                break;
            case 'oggformat':
                if (this.isValidResource(newVal)) {
                    this.oggvideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(newVal);
                }
                break;
            case 'webmformat':
                if (this.isValidResource(newVal)) {
                    this.webmvideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(newVal);
                }
                break;
            case 'subtitlesource':
                if (this.isValidResource(newVal)) {
                    const $track = this.$element.querySelector('track');
                    if ($track) {
                        $track.remove();
                    }
                    render(getTrack(this.subtitlelang, getResourceURL(newVal)), this.$element.querySelector('video'));
                }
                break;
        }
    }

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef, private sanitizer: DomSanitizer) {
        super(WIDGET_CONFIG, inj, elRef, cdr);
        styler(this.$element, this);
    }
}
