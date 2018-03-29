import { ChangeDetectorRef, Component, ElementRef, Injector } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { registerProps } from './audio.props';
import { styler } from '../../utils/styler';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

const DEFAULT_CLS = 'app-audio';
const WIDGET_CONFIG = {widgetType: 'wm-audio', hostClass: DEFAULT_CLS};

registerProps();

@Component({
    selector: '[wmAudio]',
    templateUrl: './audio.component.html'
})
export class AudioComponent extends BaseComponent {

    mp3audioUrl: SafeResourceUrl = '';

    isValidResource(value) {
        return value && typeof value === 'string' && value.indexOf('Variables') === -1;
    }

    onPropertyChange(key, newVal, oldVal) {
        if (key === 'mp3format') {
            if (this.isValidResource(newVal)) {
                this.mp3audioUrl = this.sanitizer.bypassSecurityTrustResourceUrl(newVal);
            }
        }
    }

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef, private sanitizer: DomSanitizer) {
        super(WIDGET_CONFIG, inj, elRef, cdr);

        styler(this.$element, this);
    }
}
