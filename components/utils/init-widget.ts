import { getWidgetPropsByType, PROP_TYPE } from './widget-props';
import { idMaker, isDefined, isObject } from '@utils/utils';
import { $watch, $unwatch, isChangeFromWatch } from '@utils/watcher';
import { BaseComponent } from '../widgets/base/base.component';
import { addClass, removeClass, setAttr, switchClass } from '@utils/dom';
import { isStyle } from './styler';

const widgetRegistryByName = new Map<string, any>();
const widgetRegistryByWidgetId = new Map<string, any>();
export const widgetsByName = {};

const CLS_NG_HIDE = 'ng-hide';

const idGen = idMaker('widget-id-');

const proxyHandler = {
    set: (t, k, v) => {
        globalPropertyChangeHandler(t, k, v);
        return true;
    },
    get: (t, k) => {
        return t[k];
    }
};

const registerWidget = (name: string, parentName: string, widgetId: string, widget: any, component: any) => {
    let parent;
    if (isDefined(name)) {
        widgetRegistryByName.set(name, widget);
        if (isDefined(parentName)) {
            parent = widgetsByName[parentName];
            if (parent) {
                if (!parent.Widgets) {
                    parent.Widgets = {};
                }
                parent.Widgets[name] = widget;
            }
        } else {
            widgetsByName[name] = widget;
        }
    }
    widgetRegistryByWidgetId.set(widgetId, widget);
    component.destroy$.subscribe(() => {
        widgetRegistryByName.delete(widgetId);
        widgetRegistryByWidgetId.delete(widgetId);

        if (parent) {
            delete parent.Widgets[name];
        } else {
            delete widgetsByName[name];
        }
    });
};

const getWatchIdentifier = (...args) => args.join('_');

const parseValue = (value, type) => {
    if (type === PROP_TYPE.BOOLEAN) {
        return Boolean(value).valueOf();
    }

    if (type === PROP_TYPE.NUMBER) {
        return +value;
    }
};

const defaultPropertyChangeHandler = (component: BaseComponent, key: string, nv: any, ov: any) => {
    const $el = component.$element;
    const $host = component.$host;

    if (key === 'class' || key === 'conditionalclass') {
        switchClass($el, nv, ov);
    } else if (key === 'name') {
        setAttr($el, 'name', nv);
    }
    if (key === 'show') {
        if (nv) {
            removeClass($host, CLS_NG_HIDE);
        } else {
            addClass($host, CLS_NG_HIDE);
        }
    }
    if (key === 'hint') {
        setAttr($el, 'title', nv);
    }
};

const globalPropertyChangeHandler = (component: BaseComponent, key: string, nv: any) => {
    const widgetId = component.widgetId;
    const ov = component[key];

    if (!isChangeFromWatch()) {
        $unwatch(getWatchIdentifier(widgetId, key));
    }

    const widgetProps = getWidgetPropsByType(component.widgetType);
    const propInfo = widgetProps.get(key);
    if (propInfo) {
        const type = propInfo.type;
        if (type) {
            nv = parseValue(nv, type);
        }
    }

    if (nv !== ov || isObject(nv) || isObject(ov)) {
        component[key] = nv;

        defaultPropertyChangeHandler(component, key, nv, ov);

        if (isStyle(key)) {
            component.styleChange.next({key, nv, ov});
        } else if (propInfo && propInfo.notify) {
            component.propertyChange.next({key, nv, ov});
        }

        component.$digest();
    }
};


export function initWidget(component: BaseComponent, elDef: any, view: any, parentContainer) {

    const revocable = Proxy.revocable(component, proxyHandler);
    const widget = revocable.proxy;
    const widgetId = idGen.next().value;

    component.destroy$.subscribe(() => revocable.revoke());

    const widgetProps: Map<string, any> = getWidgetPropsByType(component.widgetType);
    const $scope = view.component;
    let $locals;
    const initState: any = new Map<string, any>();

    if (view.component !== view.context) {
        $locals = view.context;
    } else {
        $locals = {};
    }

    widgetProps.forEach((v, k) => {
        if (isDefined(v.value)) {
            initState.set(k, v.value);
        }
    });

    for (const [, attrName, attrValue] of elDef.element.attrs) {
        const {0: propName, 1: bindKey, length} = attrName.split('.');
        if (bindKey === 'bind') {
            initState.delete(propName);
            component.destroy$.subscribe($watch(attrValue, $scope, $locals, nv => widget[propName] = nv, getWatchIdentifier(widgetId, propName)));
        } else if (length === 1) {
            initState.set(propName, attrValue);
        }
    }

    setAttr(component.$host, 'widget-id', widgetId);

    registerWidget(initState.get('name'), parentContainer, widgetId, widget, component);

    return () => {
        widget.name = initState.get('name'); //TODO(VinayK) - implement priority system for the props.
        initState.forEach((v, k) => {
            if (k !== 'name') {
                widget[k] = v;
            }
        });
    }
}

(<any>window).widgetRegistryByName = widgetRegistryByName;
