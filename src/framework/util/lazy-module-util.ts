import { ComponentType } from '@wm/runtime/base';

export type Options = {
    prefab: string
};

const prefabLazyModules = {};

const partialLazyModules = {};

const prefabPartialLazyModules = {};

export function getLazyModule(componentName: string, componentType: ComponentType, options?: Options) {
    if (componentType === ComponentType.PARTIAL && options && options.prefab) {
       return prefabPartialLazyModules[componentName];
    }
    if (componentType === ComponentType.PARTIAL) {
        return partialLazyModules[componentName];
    } else if (componentType === ComponentType.PREFAB) {
        return prefabLazyModules[componentName];
    }
}