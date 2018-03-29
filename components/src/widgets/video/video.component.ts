import { ChangeDetectorRef, Component, ElementRef, Injector } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { registerProps } from './video.props';
import { styler } from '../../utils/styler';
import { getResourceURL, insertAfter, removeAttr, setAttr } from '@wm/utils';
import { getImageUrl } from '../../utils/widget-utils';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';


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
                    insertAfter(getTrack(this.subtitlelang, getResourceURL(newVal)), this.$element.querySelector('video'));
                }
                break;
        }
    }

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef, private sanitizer: DomSanitizer) {
        super(WIDGET_CONFIG, inj, elRef, cdr);
        styler(this.$element, this);
    }
}
