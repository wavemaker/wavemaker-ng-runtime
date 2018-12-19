const pageComponents = new Map<string, any>();
const partialComponents = new Map<string, any>();
const prefabComponents = new Map<string, any>();
const prefabConfigs = new Map<string, any>();

export const commonPartialWidgets = {};

const registerPageComponent = (pageName: string, ref: any) => pageComponents.set(pageName, ref);
export const getPageComponentRef = pageName => pageComponents.get(pageName);

const registerPartialComponent = (partialName: string, ref: any) => partialComponents.set(partialName, ref);
export const getPartialComponentRef = partialName => partialComponents.get(partialName);

const registerPrefabComponent = (prefabName: string, ref: any) => prefabComponents.set(prefabName, ref);
export const getPrefabComponentRef = prefabName => prefabComponents.get(prefabName);

export const registerPrefabConfig = (prefabName: string, config: any) => prefabConfigs.set(prefabName, config);
export const getPrefabConfig = prefabName => prefabConfigs.get(prefabName);

export const getAllUserDefinedComponentRefs = () => {
    return Array.of(
        Array.from(pageComponents.values()),
        Array.from(partialComponents.values()),
        Array.from(prefabComponents.values())
    );
};

export const registerComponent = (name, type, ref) => {
    if (type === 'PAGE') {
        registerPageComponent(name, ref);
    } else if (type === 'PREFAB') {
        registerPrefabComponent(name, ref);
    } else {
        registerPartialComponent(name, ref);
    }
};

export const pageNames: Array<string> = Array.from(pageComponents.keys());
