export const isPrefabInPreview = (prefabName: string) => prefabName === '__self__';

export const getPrefabBaseUrl = (prefabName: string) => {
    let cdnUrl = document.querySelector('[name="cdnUrl"]') && document.querySelector('[name="cdnUrl"]').getAttribute('content');
    const prefabURL = cdnUrl.startsWith('ng-bundle') ? 'resources' : 'app/prefabs';
  return  isPrefabInPreview(prefabName) ? '.' : `${prefabURL}/${prefabName}`;
}

export const getPrefabConfigUrl = (prefabName: string) => `${getPrefabBaseUrl(prefabName)}/config.json`;

export const getPrefabMinJsonUrl = (prefabName: string) => `${getPrefabBaseUrl(prefabName)}/pages/Main/page.min.json`;

export const getPrefabPartialJsonUrl = (prefabName: string, partialName: string) => `${getPrefabBaseUrl(prefabName)}/pages/${partialName}/page.min.json`;
