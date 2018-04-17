import { Component, Injector } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { encodeUrl, isInsecureContentRequest } from '@wm/utils';

import { styler } from '../../framework/styler';
import { IStylableComponent } from '../../framework/types';
import { BaseComponent } from '../base/base.component';
import { registerProps } from './iframe.props';

const DEFAULT_CLS = 'embed-responsive app-iframe';
const WIDGET_CONFIG = {widgetType: 'wm-iframe', hostClass: DEFAULT_CLS};

registerProps();

@Component({
    selector: '[wmIframe]',
    templateUrl: './iframe.component.html'
})
export class IframeComponent extends BaseComponent {

    _iframesrc: any;

    private baseurl: string;

    showIframe;

    encodeurl: boolean;

    /**
     * this property member is set to true when the content request url doesnt match windows protocol
     */
    private showContentLoadError = false;

    constructor(inj: Injector, private sanitizer: DomSanitizer) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this as IStylableComponent);
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
            setTimeout(() => this.showIframe = true, 200);
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
