import { Injector, ElementRef, ChangeDetectorRef, Directive, forwardRef, Attribute } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { styler } from '../../utils/styler';
import { PROP_TYPE, register } from '../../utils/widget-props';

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

            if (v.type === "boolean") {
                type = PROP_TYPE.BOOLEAN;
            } else if (v.type === "number") {
                type = PROP_TYPE.NUMBER;
            } else if (v.type !== "string") {
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
        let widgetType = `wm-prefab-${prefabName}`;
        const WIDGET_CONFIG = {widgetType, hostClass: DEFAULT_CLS};

        super(WIDGET_CONFIG, inj, elRef, cdr, new Promise(res => this.propsReady = res));
        this.$element = elRef.nativeElement;

        this.prefabName = prefabName;
        this.widgetType = widgetType;

        styler(this.$element, this);
    }
}
