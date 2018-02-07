import { Component, Injector, ElementRef, ChangeDetectorRef } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { registerProps } from './audio.props';
import { styler } from '../../utils/styler';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

const WIDGET_CONFIG = {widgetType: 'wm-audio', hasTemplate: true};

registerProps();

@Component({
    selector: 'wm-audio',
    templateUrl: './audio.component.html'
})
export class AudioComponent extends BaseComponent {

    mp3audioUrl: SafeResourceUrl = '';

    isValidResource(value) {
        return value && typeof value === 'string' && value.indexOf('Variables') === -1;
    }

    onPropertyChange(key, newVal, oldVal) {
        switch (key) {
            case 'mp3format':
                if (this.isValidResource(newVal)) {
                    this.mp3audioUrl = this.sanitizer.bypassSecurityTrustResourceUrl(newVal);
                }
                break;
        }
    }

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef, private sanitizer: DomSanitizer) {
        super(WIDGET_CONFIG, inj, elRef, cdr);
    }

    _ngOnInit(): void {
        styler(this.$element, this);
    }

}
