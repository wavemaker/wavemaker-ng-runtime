import { Attribute, Directive, ElementRef, Injector, OnInit } from '@angular/core';

import { noop } from '@wm/core';
import { PROP_TYPE, provideAsWidgetRef, register, StylableComponent, styler } from '@wm/components/base';

import { customWidgetProps } from './custom-widget.props';
import { registerProps } from "../custom-widget-container/custom-widget.props";
import {capitalize, cloneDeep} from 'lodash-es';

const registeredPropsSet = new Set<string>();

let customWidgetPropsMap: { [key: string]: any } = {};

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
    private props: any = {};
    private baseWidgetName: string;

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
            if (this.props.hasOwnProperty(propName) && this.props[propName] !== nv) {
                this.props[propName] = nv;
            }
        }))
    }

    setBaseWidgetName(baseWidgetType: string) {
        let splitArr = baseWidgetType.split('-'), modifiedArr = [];
        modifiedArr = splitArr.map((item: any) => {
            item = item !== 'wm' ? capitalize(item) : item;
            return item;
        });
        this.baseWidgetName = modifiedArr.join('');
    }

    public setProps(config, resolveFn: Function) {
        this.setBaseWidgetName(config.widgetType);
        if (!config || !config.properties) {
            return;
        }
        if (!registeredPropsSet.has(this.widgetType)) {
            register(this.widgetType, this.prepareProps(config.properties));
        }else{
            this.props = Object.assign(this.props, cloneDeep(customWidgetPropsMap[this.widgetType]))
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
            this.props[k] = v.value;
        });

        registeredPropsSet.add(this.widgetType);
        customWidgetPropsMap[this.widgetType] = this.props

        return propsMap;
    }

    updateData(key: string, value: any) {
        let modifiedKey = key.replace('base-', '');
        this[this.baseWidgetName][modifiedKey] = value;
        this.nativeElement.childNodes[0]['widget'].viewParent[this.baseWidgetName][modifiedKey] = value;
        this[this.baseWidgetName].initDatasetItems();
    }
}
