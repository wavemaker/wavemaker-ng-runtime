export enum ComponentType {
    PAGE,
    PREFAB,
    PARTIAL
}

export abstract class ComponentRefProvider {
    abstract async getComponentFactoryRef(componentName: string, componentType: ComponentType): Promise<any>;
    clearComponentFactoryRefCache(): void {};
}

export abstract class PrefabConfigProvider {
    abstract async getConfig(prefabName: string): Promise<any>;
}

export abstract class AppJSProvider {
    abstract async getAppScriptFn(): Promise<Function>;
}

export abstract class AppVariablesProvider {
    abstract async getAppVariables(): Promise<any>;
}
