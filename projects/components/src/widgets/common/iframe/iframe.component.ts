import { Component, Injector, SecurityContext } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';

import { encodeUrl, isInsecureContentRequest } from '@wm/core';

import { styler } from '../../framework/styler';
import { IWidgetConfig } from '../../framework/types';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './iframe.props';
import { TrustAsPipe } from '../../../pipes/trust-as.pipe';
import { provideAsWidgetRef } from '../../../utils/widget-utils';

const DEFAULT_CLS = 'embed-responsive app-iframe';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-iframe',
    hostClass: DEFAULT_CLS
};

registerProps();

@Component({
    selector: '[wmIframe]',
    templateUrl: './iframe.component.html',
    providers: [
        provideAsWidgetRef(IframeComponent)
    ]
})
export class IframeComponent extends StylableComponent {

    public iframesrc: string;
    public encodeurl: boolean;

    private _iframesrc: SafeResourceUrl;
    private errorMsg: string;
    private hintMsg: string;

    /**
     * this property member is set to true when the content request url doesn't match windows protocol
     */
    private showContentLoadError = false;

    constructor(inj: Injector, private trustAsPipe: TrustAsPipe) {
        super(inj, WIDGET_CONFIG);
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
