import { Attribute, Directive, HostBinding, Injector, SecurityContext } from '@angular/core';

import { setCSS } from '@wm/core';

import { styler } from '../../framework/styler';
import { IWidgetConfig } from '../../framework/types';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './html.props';
import { TrustAsPipe } from '../../../pipes/trust-as.pipe';
import { provideAsWidgetRef } from '../../../utils/widget-utils';

const DEFAULT_CLS = 'app-html-container';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-html',
    hostClass: DEFAULT_CLS
};

registerProps();

@Directive({
    selector: '[wmHtml]',
    providers: [
        provideAsWidgetRef(HtmlDirective)
    ]
})
export class HtmlDirective extends StylableComponent {

    public content;

    @HostBinding('innerHTML')
    get _content() {
        return this.trustAsPipe.transform(this.content, SecurityContext.HTML);
    }

    constructor(
        inj: Injector,
        @Attribute('height') height: string,
        private trustAsPipe: TrustAsPipe,
    ) {
        super(inj, WIDGET_CONFIG);

        // if the height is provided set the overflow to auto
        if (height) {
            setCSS(this.nativeElement, 'overflow', 'auto');
        }

        styler(this.nativeElement, this);
    }
}
