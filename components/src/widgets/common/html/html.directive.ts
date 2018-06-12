import { Attribute, Directive, Injector, SecurityContext } from '@angular/core';

import { setCSS, setProperty } from '@wm/core';

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

    constructor(
        inj: Injector,
        @Attribute('height') height: string,
        @Attribute('content.bind') private boundContent: string,
        private trustAsPipe: TrustAsPipe,
    ) {
        super(inj, WIDGET_CONFIG);

        // if the height is provided set the overflow to auto
        if (height) {
            setCSS(this.nativeElement, 'overflow', 'auto');
        }

        styler(this.nativeElement, this);
    }

    onPropertyChange(key: string, nv: any, ov?: any) {
        if (key === 'content') {
            setProperty(this.nativeElement, 'innerHTML', this.trustAsPipe.transform(nv, SecurityContext.HTML));
        }
    }
}
