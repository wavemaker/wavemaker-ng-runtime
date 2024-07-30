import { Attribute, Directive, ElementRef, Injector, OnInit, Optional, SecurityContext } from '@angular/core';

import { noop } from '@wm/core';
import { IWidgetConfig, PROP_TYPE, provideAsWidgetRef, register, SanitizePipe, StylableComponent, styler } from '@wm/components/base';

import { customWidgetProps } from './custom-widget.props';
import { registerProps } from "../custom-widget-container/custom-widget.props";

const registeredPropsSet = new Set<string>();

const DEFAULT_CLS = 'app-html-container';

declare const _;

@Directive({
    selector: '[wmWidgetContainer]',
    providers: [
        provideAsWidgetRef(CustomWidgetContainerDirective)
    ],
    exportAs: 'wmWidgetContainer'
})
export class CustomWidgetContainerDirective extends StylableComponent implements OnInit {
    static initializeProps = registerProps();

    widgetType: string;
    name: string;
    propsReady: Function;
    widgetName: string;
    private pageProps: any = {};

    constructor(
        inj: Injector, elRef: ElementRef,
        @Attribute('widgetname') widgetname: string,
    ) {
        const widgetType = `wm-custom-${widgetname}`;
        const WIDGET_CONFIG = { widgetType, hostClass: DEFAULT_CLS };
        let resolveFn: Function = noop;

        super(inj, WIDGET_CONFIG, undefined, new Promise(res => resolveFn = res));
        this.propsReady = resolveFn;
        this.widgetType = widgetType;
        this.name = elRef.nativeElement.getAttribute('name');

        styler(this.nativeElement, this);

        // Call on property change on name to set name attribute on element.
        this.registerReadyStateListener(() => {
            super.onPropertyChange('name', this.name);
        });

        this.registerPropertyChangeListener(((key: string, nv: any, ov?: any) => {
            if (!key.startsWith('prop-')) return;
            const propName = key.slice(5)
            if (this.pageProps.hasOwnProperty(propName) && this.pageProps[propName] !== nv) {
                this.pageProps[propName] = nv;
            }
        }))
    }

    public setProps(config, resolveFn: Function) {
        if (!config || !config.properties) {
            return;
        }
        if (!registeredPropsSet.has(this.widgetType)) {
            register(this.widgetType, this.prepareProps(config.properties));
        }

        this.propsReady(resolveFn);
    }

    private prepareProps(props = {}) {
        const propsMap = new Map(customWidgetProps);
        Object.entries(props).forEach(([k, v]: [string, any]) => {
            let type = PROP_TYPE.STRING;

            if (v.type === 'boolean') {
                type = PROP_TYPE.BOOLEAN;
            } else if (v.type === 'number') {
                type = PROP_TYPE.NUMBER;
            } else if (v.type !== 'string') {
                type = v.type;
            }

            // Do not set the 'bind:*' values
            propsMap.set(`prop-${k}`, { type, value: _.startsWith(v.value, 'bind:') ? undefined : v.value });
            this.pageProps[k] = v.value;
        });

        registeredPropsSet.add(this.widgetType);

        return propsMap;
    }
}
