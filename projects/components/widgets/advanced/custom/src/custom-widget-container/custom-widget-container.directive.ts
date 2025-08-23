import {Attribute, Directive, ElementRef, Inject, Injector, OnInit, Optional} from '@angular/core';

import { addClass, noop } from '@wm/core';
import {PROP_TYPE, provideAs, provideAsWidgetRef, register, StylableComponent, styler} from '@wm/components/base';

import { customWidgetProps } from './custom-widget.props';
import { registerProps } from "../custom-widget-container/custom-widget.props";
import {capitalize, cloneDeep} from 'lodash-es';
import {NG_VALIDATORS, NG_VALUE_ACCESSOR} from "@angular/forms";
import {DatasetAwareFormComponent} from "@wm/components/input/dataset-aware-form";
import {Subject} from "rxjs";

const registeredPropsSet = new Set<string>();

let customWidgetPropsMap: { [key: string]: any } = {};

const DEFAULT_CLS = 'app-html-container';

declare const _;

@Directive({
  standalone: true,
    selector: '[wmWidgetContainer]',
    providers: [
        provideAs(CustomWidgetContainerDirective, NG_VALUE_ACCESSOR, true),
        provideAs(CustomWidgetContainerDirective, NG_VALIDATORS, true),
        provideAsWidgetRef(CustomWidgetContainerDirective)
    ],
    exportAs: 'wmWidgetContainer'
})
export class CustomWidgetContainerDirective extends DatasetAwareFormComponent implements OnInit {
    static initializeProps = registerProps();

    widgetType: string;
    name: string;
    propsReady: Function;
    widgetName: string;
    config: any;
    private props: any = {};
    private baseWidgetName: string;
    baseWidget: any = {};
    asAttr: boolean;
    configSubject: Subject<any>;
    onErroSubject: Subject<any>;
    _isCustom: boolean = true;

    constructor(
        inj: Injector, elRef: ElementRef,
        @Attribute('widgetname') widgetname: string,
        @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any
    ) {
        const widgetType = `wm-custom-${widgetname}`;
        const WIDGET_CONFIG = { widgetType, hostClass: DEFAULT_CLS };
        let resolveFn: Function = noop;

        super(inj, WIDGET_CONFIG, explicitContext, undefined, new Promise(res => resolveFn = res));
        this.propsReady = resolveFn;
        this.configSubject = new Subject();
        this.onErroSubject = new Subject();
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

    get datavalue() {
        if(this.nativeElement.children.length) {
            let value = this.nativeElement.children[0].children[0]['widget'].viewParent.datavalue;
            this.updateDataValue(value);
            return value;
        }
    }

    set datavalue(value) {
        if(this.nativeElement.children.length)
            this.nativeElement.children[0].children[0]['widget'].viewParent.datavalue = value;
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
        this.config = config;
        this.baseWidgetName = this.config.projectPropsOn || this.config.widgetType.split('wm-')[1];
        this.configSubject.next(null);
        if(config.customClasses){
            addClass(this.nativeElement, config.customClasses);
        }
        this.asAttr = this.nativeElement.children[0].children[0].hasAttribute('as');

        this.baseWidget = (this.nativeElement.children[0].children[0].querySelector(`[name=${this.baseWidgetName}]`) as any)?.widget;
        // if(this.asAttr)
        //     this.setBaseWidgetName(config.widgetType);
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

    updateDataValue(value) {
        if(this.formControl && this.formControl.control && value !== this.formControl.control.value) {
            this.formControl.control.setValue(value);
            if (this.formControl.control.invalid) {
                this.onErroSubject.next(null);
            }
        }
    }

    updateData(key: string, value: any) {
        let modifiedKey = key.replace('base-', '');
        if(this.asAttr) {
            this[this.baseWidgetName][modifiedKey] = value;
            this.nativeElement.children[0].children[0]['widget'].viewParent[this.baseWidgetName][modifiedKey] = value;
            this[this.baseWidgetName].initDatasetItems();
        } else {
            this[modifiedKey] = value;
            this.nativeElement.children[0].children[0]['widget'].viewParent[modifiedKey] = value;
        }
        if(this.formControl && modifiedKey === 'datavalue'){
            this.updateDataValue(value);
        }
    }
}
