import {$appDigest, $unwatch, isChangeFromWatch, isObject, resetChangeFromWatch, setAttr, switchClass, toBoolean} from '@wm/core';

import { BaseComponent } from '../common/base/base.component';
import { getWidgetPropsByType, PROP_TYPE } from './widget-props';
import { isStyle } from './styler';
import { getWatchIdentifier } from '../../utils/widget-utils';

// set of boolean attrs
const BOOLEAN_ATTRS = new Set([
    'readonly', 'autofocus', 'disabled', 'startchecked', 'multiple',
    'selected', 'required', 'controls', 'autoplay', 'loop', 'muted'
]);

/**
 * Returns true if the provided key is a boolean attribute
 * @param {string} key
 * @returns {boolean}
 */
const isBooleanAttr = (key: string): boolean => BOOLEAN_ATTRS.has(key);

/**
 * Returns the parsed value based on the provided type
 * if the type is PROP_TYPE.NUMBER returns a number/NaN
 * if the type is PROP_BOOLEAN returns true/false
 * else returns the same value without any type conversion
 *
 * @param {string} key
 * @param value
 * @param {PROP_TYPE} type
 * @returns {any}
 */
const parseValue = (key: string, value: any, type: PROP_TYPE): any => {
    if (type === PROP_TYPE.BOOLEAN) {
        return toBoolean(value, isBooleanAttr(key) && key);
    }

    if (type === PROP_TYPE.NUMBER) {
        return +value;
    }

    return value;
};

/**
 * Handles the common functionality across the components
 * eg,
 *  1. value of the class property will be applied on the host element
 *  2. based on the value of show property component is shown/hidden
 *
 * @param {BaseComponent} component
 * @param {string} key
 * @param nv
 * @param ov
 */
const defaultPropertyChangeHandler = (component: BaseComponent, key: string, nv: any, ov: any): void => {
    const el = component.getNativeElement();

    if (key === 'class' || key === 'conditionalclass') {
        switchClass(el, nv, ov);
    } else if (key === 'name') {
        setAttr(el, 'name', nv);
    } else if (key === 'show') {
        nv = parseValue(key, nv, PROP_TYPE.BOOLEAN);
        component.getNativeElement().hidden = !nv;
    } else if (key === 'hint') {
        setAttr(el, 'title', nv);
    }
};


/**
 * Whenever a property on a component changes through a proxy this method will be triggered
 * If the new value is not from a watch, the existing watch on that particular property will be removed
 * This method invokes the defaultPropertyChange handler where the common widget properties like name, class are handled
 * Notifies the component about the style/property change
 */
const globalPropertyChangeHandler = (component: BaseComponent, key: string, nv: any) => {
    const widgetId = component.widgetId;
    const ov = component[key];

    // if the change is not from the bound watch, remove the existing watch
    if (!isChangeFromWatch()) {
        $unwatch(getWatchIdentifier(widgetId, key));
    }

    resetChangeFromWatch();

    const widgetProps = getWidgetPropsByType(component.getWidgetSubType());
    const propInfo = widgetProps.get(key);
    if (propInfo) {
        const type = propInfo.type;
        if (type) {
            nv = parseValue(key, nv, type);
        }
    }

    // Set the value in the component and trigger appDigest when there is a change in the value
    if (nv !== ov || isObject(nv) || isObject(ov)) {
        component[key] = nv;

        defaultPropertyChangeHandler(component, key, nv, ov);

        if (isStyle(key)) {
            component.notifyStyleChange(key, nv, ov);
        } else if (propInfo && propInfo.notify) {
            component.notifyPropertyChange(key, nv, ov);
        }

        $appDigest();
    }
};


/**
 *  proxy handler for the components
 */
export const proxyHandler = {
    set: (target: BaseComponent, key: string, value: any): boolean => {
        globalPropertyChangeHandler(target, key, value);
        return true;
    },
    get: (target: BaseComponent, key: string): any => {
        return target[key];
    }
};