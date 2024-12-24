import {_WM_APP_PROJECT} from "@wm/core";

export const isPrefabInPreview = (prefabName: string) => prefabName === '__self__';

export const getPrefabBaseUrl = (prefabName: string) => {
    const basePath = _WM_APP_PROJECT.isPreview ? 'app/prefabs' : _WM_APP_PROJECT.cdnUrl + 'resources';
   return isPrefabInPreview(prefabName) ? '.' :  basePath + `/${prefabName}`
};

export const getPrefabConfigUrl = (prefabName: string) => `${getPrefabBaseUrl(prefabName)}/config.json`;

export const getPrefabMinJsonUrl = (prefabName: string) => `${getPrefabBaseUrl(prefabName)}/pages/Main/page.min.json`;

export const getPrefabPartialJsonUrl = (prefabName: string, partialName: string) => `${getPrefabBaseUrl(prefabName)}/pages/${partialName}/page.min.json`;
