import { getWidgetPropsByType, PROP_TYPE } from './widget-props';
import { idMaker, isDefined, isObject } from '@utils/utils';
import { $watch, $unwatch, isChangeFromWatch } from '@utils/watcher';
import { BaseComponent } from '../widgets/base/base.component';
import { addClass, removeClass, setAttr, switchClass } from '@utils/dom';
import { isStyle } from '@utils/styler';

const widgetRegistryByName = new Map<string, any>();
const widgetRegistryByWidgetId = new Map<string, any>();

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

const registerWidget = (name: string, widgetId: string, widget: any, component: any) => {
    if (isDefined(name)) {
        widgetRegistryByName.set(name, widget);
    }
    widgetRegistryByWidgetId.set(widgetId, widget);
    component.addDestroyListener(() => {
        widgetRegistryByName.delete(widgetId);
        widgetRegistryByWidgetId.delete(widgetId);
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
            component.onStyleChange(key, nv, ov);
        } else if (propInfo && propInfo.notify) {
            component.onPropertyChange(key, nv, ov);
        }

        component.$digest();
    }
};


export function initWidget(component: BaseComponent, widgetType: string, elDef: any, view: any) {

    const revocable = Proxy.revocable(component, proxyHandler);
    const widget = revocable.proxy;
    const widgetId = idGen.next().value;

    component.widgetId = widgetId;
    component.widgetType = widgetType;
    component.destroyListeners = [];

    component.addDestroyListener(() => revocable.revoke());

    const widgetProps: Map<string, any> = getWidgetPropsByType(widgetType);
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
            component.addDestroyListener($watch(attrValue, $scope, $locals, nv => widget[propName] = nv, getWatchIdentifier(widgetId, propName)));
        } else if (length === 1) {
            initState.set(propName, attrValue);
        }
    }

    setAttr(component.$element, 'widget-id', widgetId);

    registerWidget(initState.get('name'), widgetId, widget, component);

    initState.forEach((v, k) => {
        widget[k] = v;
    });
}

(<any>window).widgetRegistryByName = widgetRegistryByName;
