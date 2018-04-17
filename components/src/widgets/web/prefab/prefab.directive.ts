import { Attribute, ChangeDetectorRef, Directive, ElementRef, forwardRef, Injector } from '@angular/core';

import { IStylableComponent } from '../../framework/types';
import { styler } from '../../framework/styler';
import { PROP_TYPE, register } from '../../framework/widget-props';
import { BaseComponent } from '../base/base.component';

const DEFAULT_CLS = 'app-prefab';

const registeredPropsSet = new Set<string>();

@Directive({
    selector: 'section[wmPrefab]',
    providers: [
        {provide: '@Widget', useExisting: forwardRef(() => PrefabDirective)}
    ]
})
export class PrefabDirective extends BaseComponent {

    widgetType: string;
    prefabName: string;
    propsReady: Function;

    prepareProps(props = {}) {
        const propsMap = new Map<string, any>();
        Object.entries(props).forEach(([k, v]: [string, any]) => {
            let type = PROP_TYPE.STRING;

            if (v.type === 'boolean') {
                type = PROP_TYPE.BOOLEAN;
            } else if (v.type === 'number') {
                type = PROP_TYPE.NUMBER;
            } else if (v.type !== 'string') {
                type = v.type;
            }

            propsMap.set(k, {type, notify: true, value: v.value});
        });

        registeredPropsSet.add(this.widgetType);

        return propsMap;
    }

    setPrefabProps(props) {
        if (!registeredPropsSet.has(this.widgetType)) {
            register(this.widgetType, this.prepareProps(props));
        }

        this.propsReady();
    }

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef, @Attribute('prefabname') prefabName) {
        const widgetType = `wm-prefab-${prefabName}`;
        const WIDGET_CONFIG = {widgetType, hostClass: DEFAULT_CLS};

        super(inj, WIDGET_CONFIG, new Promise(res => this.propsReady = res));
        this.nativeElement = elRef.nativeElement;

        this.prefabName = prefabName;
        this.widgetType = widgetType;

        styler(this.nativeElement, this as IStylableComponent);
    }
}
