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

export const getModesFromLocalStorage = (modes?: any): Record<string, string> => {
    const defaultModes: string[] = [MODE_CONSTANTS.COLOR, MODE_CONSTANTS.SPACE, MODE_CONSTANTS.FONT, MODE_CONSTANTS.RADIUS];
    const restoredModes: Record<string, string> = {};
    defaultModes.forEach((key) => {
        const storedValue = modes && modes[key] || localStorage.getItem(`${MODE_CONSTANTS.MODE_KEY}-${key}`);
        if (storedValue !== null) {
            restoredModes[key] = storedValue;
        }
    });
    return restoredModes;
};