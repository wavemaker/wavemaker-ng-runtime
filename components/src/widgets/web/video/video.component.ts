import { Component, Injector } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';

import { getResourceURL, insertAfter, isString, removeAttr, setAttr } from '@wm/core';

import { StylableComponent } from '../base/stylable.component';
import { styler } from '../../framework/styler';
import { registerProps } from './video.props';
import { getImageUrl } from '../../../utils/widget-utils';

const DEFAULT_CLS = 'app-video';
const WIDGET_CONFIG = {widgetType: 'wm-video', hostClass: DEFAULT_CLS};

const getTrack = (subtitleLang, trackSource) => {
    const track = document.createElement('track');
    setAttr(track, 'kind', 'subtitles');
    setAttr(track, 'label', subtitleLang);
    setAttr(track, 'srclang', subtitleLang);
    setAttr(track, 'src', trackSource);
    setAttr(track, 'default', '');
    return track;
};

registerProps();

@Component({
    selector: '[wmVideo]',
    templateUrl: './video.component.html'
})
export class VideoComponent extends StylableComponent {

    mp4videoUrl: SafeResourceUrl = '';
    webmvideoUrl: SafeResourceUrl = '';
    oggvideoUrl: SafeResourceUrl = '';
    videoposter;
    subtitlelang;

    isValidResource(value) {
        return value && isString(value);
    }

    onPropertyChange(key, newVal, oldVal) {
        switch (key) {
            case 'videoposter':
                const $video = this.nativeElement.querySelector('video');
                if (!newVal) {
                    removeAttr($video, 'poster');
                } else {
                    setAttr($video, 'poster', getImageUrl(newVal));
                }
                break;
            case 'mp4format':
                if (this.isValidResource(newVal)) {
                    this.mp4videoUrl = newVal;
                }
                break;
            case 'oggformat':
                if (this.isValidResource(newVal)) {
                    this.oggvideoUrl = newVal;
                }
                break;
            case 'webmformat':
                if (this.isValidResource(newVal)) {
                    this.webmvideoUrl = newVal;
                }
                break;
            case 'subtitlesource':
                if (this.isValidResource(newVal)) {
                    const $track = this.nativeElement.querySelector('track');
                    if ($track) {
                        $track.remove();
                    }
                    insertAfter(getTrack(this.subtitlelang, getResourceURL(newVal)), this.nativeElement.querySelector('video'));
                }
                break;
        }
    }

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);
    }
}
