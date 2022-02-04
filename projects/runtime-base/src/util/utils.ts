export const isPrefabInPreview = (prefabName: string) => prefabName === '__self__';

export const getPrefabBaseUrl = (prefabName: string) => isPrefabInPreview(prefabName) ? '.' : `app/prefabs/${prefabName}`;

export const getPrefabConfigUrl = (prefabName: string) => `${getPrefabBaseUrl(prefabName)}/config.json`;

export const getPrefabMinJsonUrl = (prefabName: string) => `${getPrefabBaseUrl(prefabName)}/pages/Main/page.min.json`;

export const getPrefabPartialJsonUrl = (prefabName: string, partialName: string) => `${getPrefabBaseUrl(prefabName)}/pages/${partialName}/page.min.json`;
