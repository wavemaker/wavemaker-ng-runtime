export enum ComponentType {
    PAGE,
    PREFAB,
    PARTIAL,
    WIDGET
}

export abstract class ComponentRefProvider {
    abstract getComponentFactoryRef(componentName: string, componentType: ComponentType): Promise<any>;
    clearComponentFactoryRefCache(): void {};
}

export abstract class PrefabConfigProvider {
    abstract getConfig(prefabName: string): Promise<any>;
}

export abstract class AppJSProvider {
    abstract getAppScriptFn(): Promise<Function>;
}

export abstract class AppVariablesProvider {
    abstract getAppVariables(): Promise<any>;
}
export abstract class AppExtensionProvider {
    abstract  loadFormatterConfigScript(callback:Function): void;
}

