import { Attribute, ChangeDetectorRef, Directive, ElementRef, Injector, OnDestroy } from '@angular/core';

import { setCSS } from '@wm/core';

import { PROP_TYPE, register, provideAsWidgetRef, StylableComponent, styler } from '@wm/components/base';
import { prefabProps } from './prefab.props';

const DEFAULT_CLS = 'app-prefab';

const registeredPropsSet = new Set<string>();

declare const _;

@Directive({
    selector: 'section[wmPrefab]',
    providers: [
        provideAsWidgetRef(PrefabDirective)
    ]
})
export class PrefabDirective extends StylableComponent implements OnDestroy {

    widgetType: string;
    prefabName: string;
    name: string;
    propsReady: Function;

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef, @Attribute('prefabname') prefabName) {
        const widgetType = `wm-prefab-${prefabName}`;
        const WIDGET_CONFIG = {widgetType, hostClass: DEFAULT_CLS};

        super(inj, WIDGET_CONFIG, new Promise(res => this.propsReady = res));

        this.prefabName = prefabName;
        this.widgetType = widgetType;
        this.name = elRef.nativeElement.getAttribute('name');

        styler(this.nativeElement, this);

        // Call on property change on name to set name attribute on element.
        this.registerReadyStateListener(() => {
            super.onPropertyChange('name', this.name);
        });
    }

    onStyleChange(key: string, nv: any, ov: any) {
        if (key === 'height') {
            setCSS(this.nativeElement, 'overflow', 'auto');
        }
    }

    public setProps(config) {
        if (!config || !config.properties) {
            return;
        }

        if (!registeredPropsSet.has(this.widgetType)) {
            register(this.widgetType, this.prepareProps(config.properties));
        }

        this.propsReady();
    }

    protected handleEvent() {
        // do not call the super;
        // prevent events from getting registered
    }

    private prepareProps(props = {}) {
        const propsMap = new Map(prefabProps);
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
            propsMap.set(k, {type, value: _.startsWith(v.value, 'bind:') ? undefined : v.value});
        });

        registeredPropsSet.add(this.widgetType);

        return propsMap;
    }

    ngOnDestroy() {
        this.invokeEventCallback('destroy', { widget: this });
    }
}
