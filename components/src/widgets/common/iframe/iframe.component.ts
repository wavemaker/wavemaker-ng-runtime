import { Component, forwardRef, Injector } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { encodeUrl, isInsecureContentRequest } from '@wm/core';

import { styler } from '../../framework/styler';
import { WidgetRef } from '../../framework/types';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './iframe.props';

const DEFAULT_CLS = 'embed-responsive app-iframe';
const WIDGET_CONFIG = {widgetType: 'wm-iframe', hostClass: DEFAULT_CLS};

registerProps();

@Component({
    selector: '[wmIframe]',
    templateUrl: './iframe.component.html',
    providers: [
        {provide: WidgetRef, useExisting: forwardRef(() => IframeComponent)}
    ]
})
export class IframeComponent extends StylableComponent {

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
        styler(this.nativeElement, this);
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
