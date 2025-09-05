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

export const getModesFromLocalStorage = () => {
    // get modes
    let storedValue: any = localStorage.getItem(`wm-app-modes`) || '{}';

    // parse the modes 
    try {
        storedValue = JSON.parse(storedValue);
    } catch (error) {
        console.error("Error parsing modes", error.message);
        storedValue = {}
    }
    
    // return parsed modes
    return storedValue;
};