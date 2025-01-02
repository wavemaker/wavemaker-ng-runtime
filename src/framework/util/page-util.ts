const prefabConfigs = new Map<string, any>();
const customWidgetConfigs = new Map<string, any>();

export const registerPrefabConfig = (prefabName: string, config: any) => prefabConfigs.set(prefabName, config);
export const getPrefabConfig = prefabName => prefabConfigs.get(prefabName);
export const registerCustomWidgetConfig = (customWidget: string, config: any) => customWidgetConfigs.set(customWidget, config);
export const getCustomWidgetConfig = customWidget => customWidgetConfigs.get(customWidget);
