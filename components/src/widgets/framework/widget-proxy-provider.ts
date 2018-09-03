/**
 * Proxy Provider - Creates a JS proxy for the given object
 */
import { propNameCSSKeyMap } from './styler';
import { globalPropertyChangeHandler } from './property-change-handler';
import { BaseComponent } from '../common/base/base.component';

declare const _;

/**
 *  proxy handler for the components
 */
export const proxyHandler = {
    set: (target: BaseComponent, key: string, value: any): boolean => {
        globalPropertyChangeHandler(target, key, value);
        return true;
    },
    get: (target: BaseComponent, key: string): any => {
        const v = target[key];
        if (_.isFunction(v)) { // bind the proper context for the methods
            return v.bind(target);
        }
        return v;
    }
};

export class WidgetProxyProvider {
    public static create(instance: BaseComponent, widgetSubType: string, propsByWidgetSubType: Map<string, any>) {
        // If the native Proxy is supported
        if ((window as any).Proxy) {
            return new Proxy(instance, proxyHandler);
        } else {

            // If the native Proxy is not supported, IE11
            const widget = Object.create(instance);

            // bind proper context for the methods
            for (const key in instance) {
                if (_.isFunction(instance[key])) {
                    instance[key] = instance[key].bind(instance);
                }
            }


            // define setters and getters for styles
            Object.keys(propNameCSSKeyMap)
                .forEach(key => {
                    Object.defineProperty(widget, key, {
                        get: () => instance[key],
                        set: nv => globalPropertyChangeHandler(instance, key, nv)
                    });
                });

            // define the setters and getters for Props
            if (propsByWidgetSubType) {
                propsByWidgetSubType
                    .forEach((value, key) => {
                        Object.defineProperty(widget, key, {
                            get: () => instance[key],
                            set: nv => globalPropertyChangeHandler(instance, key, nv)
                        });
                    });
            }

            return widget;
        }
    }
}
