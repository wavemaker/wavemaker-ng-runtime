import {
    Attribute,
    ChangeDetectorRef,
    Directive,
    ElementRef,
    Inject,
    Injector,
    OnDestroy,
    Optional
} from '@angular/core';

import {setCSS, noop} from '@wm/core';

import { PROP_TYPE, register, provideAsWidgetRef, StylableComponent, styler } from '@wm/components/base';
import { prefabProps } from './prefab.props';
import {startsWith} from "lodash-es";

const DEFAULT_CLS = 'app-prefab';

const registeredPropsSet = new Set<string>();

@Directive({
  standalone: true,
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

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef, @Attribute('prefabname') prefabName, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
        const widgetType = `wm-prefab-${prefabName}`;
        const WIDGET_CONFIG = {widgetType, hostClass: DEFAULT_CLS};
        let resolveFn: Function = noop;

        super(inj, WIDGET_CONFIG, explicitContext, new Promise(res => resolveFn = res));
        this.propsReady = resolveFn;
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
            propsMap.set(k, {type, value: startsWith(v.value, 'bind:') ? undefined : v.value});
        });

        registeredPropsSet.add(this.widgetType);

        return propsMap;
    }

    ngOnDestroy() {
        this.invokeEventCallback('destroy', { widget: this });
        
        // CRITICAL FIX: Call super.ngOnDestroy() to unwatch all watchers
        // Without this, all watchers in prefabs remain in memory
        super.ngOnDestroy();
    }
}
