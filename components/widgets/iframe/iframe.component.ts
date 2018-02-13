import { Component, Injector, ElementRef, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BaseComponent } from '../base/base.component';
import { encodeUrl, isInsecureContentRequest } from '@utils/utils';
import { styler } from '../../utils/styler';
import { registerProps } from './iframe.props';

const DEFAULT_CLS = 'embed-responsive app-iframe';
const WIDGET_CONFIG = {widgetType: 'wm-iframe', hostClass: DEFAULT_CLS};

registerProps();

@Component({
    selector: '[wmIframe]',
    templateUrl: './iframe.component.html'
})
export class IframeComponent extends BaseComponent {

    private _iframesrc;

    private baseurl: string;

    encodeurl: boolean;

    /**
     * this property member is set to true when the content request url doesnt match windows protocol
     */
    private showContentLoadError = false;

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef, private sanitizer: DomSanitizer) {
        super(WIDGET_CONFIG, inj, elRef, cdr);
        styler(this.$element, this);
    }

    onIframeSrcChange(newVal) {
        if (isInsecureContentRequest(newVal)) {
            this.showContentLoadError = true;
            this._iframesrc = '';
            return;
        }
        if (typeof newVal === 'string' && this._iframesrc !== newVal) {
            if (this.encodeurl) {
                newVal = encodeUrl(newVal);
            }
            this.baseurl = newVal;
            this._iframesrc = this.sanitizer.bypassSecurityTrustResourceUrl(newVal);
        }
    }

    onPropertyChange(key, newVal, oldVal) {
        switch (key) {
            case 'iframesrc':
                this.onIframeSrcChange(newVal);
                break;
            case 'encodeurl':
                this.onIframeSrcChange(this.baseurl);
                break;
        }
    }
}
