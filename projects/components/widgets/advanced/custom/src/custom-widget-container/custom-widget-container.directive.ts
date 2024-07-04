import {Attribute, Directive, Injector, OnInit, Optional, SecurityContext} from '@angular/core';

import {setCSS, setProperty} from '@wm/core';
import { IWidgetConfig, provideAsWidgetRef, SanitizePipe, StylableComponent, styler } from '@wm/components/base';

import { registerProps } from './custom-widget.props';

const DEFAULT_CLS = 'app-html-container';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-custom-widget',
    hostClass: DEFAULT_CLS
};

@Directive({
    selector: '[wmWidgetContainer]',
    providers: [
        provideAsWidgetRef(CustomWidgetContainerDirective)
    ],
    exportAs: 'wmWidgetContainer'
})
export class CustomWidgetContainerDirective extends StylableComponent implements OnInit {
    static initializeProps = registerProps();
    public content: string;
    public prop: any = {};

    constructor(
        inj: Injector,
        @Attribute('height') height: string,
    ) {
        super(inj, WIDGET_CONFIG);

        // if the height is provided set the overflow to auto
        if (height) {
            setCSS(this.nativeElement, 'overflow', 'auto');
        }

        styler(this.nativeElement, this);
    }

    ngOnInit() {
        super.ngOnInit();
        const attrs = this.nativeElement.attributes;
        for (let attrName, attrVal, i = 0; i < attrs.length; i++){
            attrName = attrs[i].nodeName;
            attrVal = attrs[i].nodeValue;
            if (attrName.startsWith('prop-')) {
                attrName = attrName.replace('prop-', '');
                this.prop[attrName] = attrVal;
            }
        }
    }

    onPropertyChange(key: string, nv: any, ov?: any) {
        super.onPropertyChange(key, nv, ov);
    }
}
