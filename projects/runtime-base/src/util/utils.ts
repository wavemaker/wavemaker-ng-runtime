import { _WM_APP_PROJECT } from "@wm/core";
import { MODE_CONSTANTS } from '@wm/variables';

export const isPrefabInPreview = (prefabName: string) => prefabName === '__self__';

export const getPrefabBaseUrl = (prefabName: string) => {
    const basePath = _WM_APP_PROJECT.isPreview ? 'app/prefabs' : _WM_APP_PROJECT.cdnUrl + 'resources';
    return isPrefabInPreview(prefabName) ? '.' : basePath + `/${prefabName}`
};

export const getPrefabConfigUrl = (prefabName: string) => `${getPrefabBaseUrl(prefabName)}/config.json`;

export const getPrefabMinJsonUrl = (prefabName: string) => `${getPrefabBaseUrl(prefabName)}/pages/Main/page.min.json`;

export const getPrefabPartialJsonUrl = (prefabName: string, partialName: string) => `${getPrefabBaseUrl(prefabName)}/pages/${partialName}/page.min.json`;

export const setAppMode = (modes: Record<string, string>, shouldPersist = true) => {
    const htmlEl = document.getElementsByTagName('html')[0];
    if (!htmlEl) return;

    (Object.entries(modes)).forEach(([modeKey, modeValue]) => {
        const storageKey = `${MODE_CONSTANTS.MODE_KEY}-${modeKey}`;
        const isDefault = modeValue === MODE_CONSTANTS.LIGHT || modeValue === MODE_CONSTANTS.DEFAULT;

        if (isDefault) {
            if (shouldPersist) localStorage.removeItem(storageKey);
            htmlEl.removeAttribute(modeKey);
        } else {
            if (shouldPersist) localStorage.setItem(storageKey, modeValue);
            htmlEl.setAttribute(modeKey, modeValue);
        }
    });
};