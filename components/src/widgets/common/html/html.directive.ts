import { Attribute, Directive, forwardRef, Injector } from '@angular/core';

import { setCSS } from '@wm/core';

import { styler } from '../../framework/styler';
import { IWidgetConfig, WidgetRef } from '../../framework/types';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './html.props';

const DEFAULT_CLS = 'app-html-container';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-html',
    hostClass: DEFAULT_CLS
};

registerProps();

@Directive({
    selector: '[wmHtml]',
    providers: [
        {provide: WidgetRef, useExisting: forwardRef(() => HtmlDirective)}
    ]
})
export class HtmlDirective extends StylableComponent {

    constructor(inj: Injector, @Attribute('height') height) {
        super(inj, WIDGET_CONFIG);

        // if the height is provided set the overflow to auto
        if (height) {
            setCSS(this.nativeElement, 'overflow', 'auto');
        }

        styler(this.nativeElement, this);
    }
}
