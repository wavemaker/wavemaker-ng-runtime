import { Component, HostBinding, Injector } from '@angular/core';

import { encodeUrl, setAttr } from '@wm/core';

import { styler } from '../../framework/styler';
import { IWidgetConfig } from '../../framework/types';
import { DISPLAY_TYPE } from '../../framework/constants';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './anchor.props';
import { provideAsWidgetRef } from '../../../utils/widget-utils';


registerProps();

const DEFAULT_CLS = 'app-anchor';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-anchor',
    hostClass: DEFAULT_CLS,
    displayType: DISPLAY_TYPE.INLINE_BLOCK
};

@Component({
    selector: 'a[wmAnchor]',
    templateUrl: './anchor.component.html',
    providers: [
        provideAsWidgetRef(AnchorComponent)
    ]
})
export class AnchorComponent extends StylableComponent {
    public encodeurl;

    @HostBinding('target') target: string;
    @HostBinding('attr.tabindex') tabindex: number;
    @HostBinding('attr.accesskey') shortcutkey: string;
    @HostBinding('attr.icon-position') iconposition: string;

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        setAttr(this.nativeElement, 'href', 'javascript:void(0)');

        styler(this.nativeElement, this);
    }

    onPropertyChange(key: string, nv: any) {
        if (key === 'hyperlink') {
            if (this.encodeurl) {
                nv = encodeUrl(nv);
            }
            // if hyperlink starts with 'www.' append '//' in the beginning
            if (nv.startsWith('www.')) {
                nv = `//${nv}`;
            }
            setAttr(this.nativeElement, 'href', nv);
        }
    }
}