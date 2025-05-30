import {
    $appDigest,
    $unwatch,
    _WM_APP_PROJECT,
    isChangeFromWatch,
    isObject,
    resetChangeFromWatch,
    toBoolean,
    toDimension
} from '@wm/core';

import { BaseComponent } from '../common/base/base.component';
import { getWidgetPropsByType, PROP_TYPE } from './widget-props';
import { isStyle } from './styler';
import { getConditionalClasses, getWatchIdentifier } from '../../utils/widget-utils';
import { isBooleanAttr, isDimensionProp } from './constants';
import {startsWith} from "lodash-es";

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
 * Whenever a property on a component changes through a proxy this method will be triggered
 * If the new value is not from a watch, the existing watch on that particular property will be removed
 * This method invokes the defaultPropertyChange handler where the common widget properties like name, class are handled
 * Notifies the component about the style/property change
 */
export const globalPropertyChangeHandler = (component: BaseComponent, key: string, nv: any) => {
    const widgetId = component.widgetId;
    const ov = component[key];

    // if the change is not from the bound watch, remove the existing watch
    if (!isChangeFromWatch()) {
        $unwatch(getWatchIdentifier(widgetId, key));
    }

    resetChangeFromWatch();

    const widgetProps = getWidgetPropsByType(component.getWidgetSubType());
    const propInfo = widgetProps ? widgetProps.get(key) : undefined;
    if (propInfo) {
        const type = propInfo.type;
        if (type) {
            nv = parseValue(key, nv, type);
        }
    }

    // Set the value in the component and trigger appDigest when there is a change in the value
    if (nv !== ov || isObject(nv) || isObject(ov)) {

        if (isDimensionProp(key)) {
            nv = toDimension(nv);
        } else if (startsWith(nv, 'resources/') || startsWith(nv, './resources/')) {
            //picture placeholder from image picture returns "./resources/" where are source returns "resources/"
            if(startsWith(nv, './resources/')) {
                nv = nv.slice(2); //remove "./" at the beginning and return "resources/"
            }
            const ref: any = component;
            if (ref._parentPrefab_ === undefined) {
                let prefabName = component.$element.parent().closest('[prefabname][prefabname!="__self__"]').attr('prefabname');
                //if the component is inside a tabpane or anything, where the content is lazily loaded. in such scenario the prefabName is undefined
                if(prefabName === undefined) {
                    // @ts-ignore
                    prefabName = component.viewParent.prefabName;
                }
                ref._parentPrefab_ = prefabName || '';
            }
            if (ref._parentPrefab_ && ref._parentPrefab_ !== '__self__') {
                nv = (_WM_APP_PROJECT.isPreview ? `./app/prefabs` : `${_WM_APP_PROJECT.cdnUrl}` + 'resources') + `/${ref._parentPrefab_}/${nv}`;
            } else if(propInfo && nv != propInfo.value) {
                nv = (_WM_APP_PROJECT.isPreview ? '' : _WM_APP_PROJECT.cdnUrl) + nv;
            }
        }

        component[key] = nv;

        if (isStyle(key)) {
            component.notifyStyleChange(key, nv, ov);
        } else {

            if (key === 'conditionalclass') {
                nv = getConditionalClasses(nv, ov);
            }

            if (propInfo) {
                component.notifyPropertyChange(key, nv, ov);
            }
        }

        $appDigest();
    }
};
