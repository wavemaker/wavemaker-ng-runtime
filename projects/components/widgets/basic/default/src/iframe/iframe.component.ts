import { Component, Inject, Injector, Optional, SecurityContext } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';

import { encodeUrl, isInsecureContentRequest } from '@wm/core';
import { IWidgetConfig, provideAsWidgetRef, StylableComponent, styler, TrustAsPipe, WmComponentsModule } from '@wm/components/base';

import { registerProps } from './iframe.props';
import { CommonModule } from '@angular/common';

const DEFAULT_CLS = 'embed-responsive app-iframe';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-iframe',
    hostClass: DEFAULT_CLS
};

@Component({
    selector: '[wmIframe]',
    templateUrl: './iframe.component.html',
    providers: [
        provideAsWidgetRef(IframeComponent)
    ],
    standalone: true,
    imports: [CommonModule, WmComponentsModule]
})
export class IframeComponent extends StylableComponent {
    static initializeProps = registerProps();

    public iframesrc: string;
    public encodeurl: boolean;

    public _iframesrc: SafeResourceUrl;
    private errorMsg: string;
    private hintMsg: string;

    public caption;
    public name: string;
    public hint: string;
    public arialabel: string;
    /**
     * this property member is set to true when the content request url doesn't match windows protocol
     */
    public showContentLoadError = false;

    constructor(inj: Injector, private trustAsPipe: TrustAsPipe, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext) {
        super(inj, WIDGET_CONFIG, explicitContext);
        styler(this.nativeElement, this);
    }

    protected computeIframeSrc() {
        this.showContentLoadError = false;
        this._iframesrc = undefined;

        if (this.iframesrc) {
            let url = this.iframesrc;
            if (this.encodeurl) {
                url = encodeUrl(this.iframesrc);
            }

            const trustedUrl = this.trustAsPipe.transform(url, SecurityContext.RESOURCE_URL);

            if (isInsecureContentRequest(url)) {
                this.showContentLoadError = true;

                this.errorMsg = `${this.appLocale.MESSAGE_ERROR_CONTENT_DISPLAY} ${this.iframesrc}`;
                this.hintMsg = this.errorMsg;
            }

            this._iframesrc = trustedUrl;
        }
    }

    onPropertyChange(key, nv, ov?) {
        if (key === 'iframesrc' || key === 'encodeurl') {
            this.computeIframeSrc();
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }
}
