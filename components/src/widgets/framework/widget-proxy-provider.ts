/**
 * Proxy Provider - Creates a JS proxy for the given object
 */
import { propNameCSSKeyMap } from './styler';
import { globalPropertyChangeHandler } from './property-change-handler';
import { BaseComponent } from '../common/base/base.component';

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

export class WidgetProxyProvider {
    public static create(instance: BaseComponent, widgetSubType: string, propsByWidgetSubType: Map<string, any>) {
        // If the native Proxy is supported
        if ((window as any).Proxy) {
            const revocable = Proxy.revocable(instance, proxyHandler);
            instance.registerDestroyListener(() => revocable.revoke());

            return revocable.proxy;
        } else {

            // If the native Proxy is not supported, IE11
            const widget = {};
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

            // define getter for $element
            Object.defineProperty(widget, '$element', {
                get: () => instance.$element
            });

            return widget;
        }
    }
}
