import { oauthService, appManager } from './variable/variables.utils';

export const performAuthorization = (url, providerId, onSuccess, onError, securityObj?) => {
    oauthService.perfromOAuthorization(url, providerId, onSuccess, onError, securityObj, appManager.getCustomUrlScheme());
};

export const getAccessToken = (provider, checkLoaclStorage) => {
    return oauthService.getAccessToken(provider, checkLoaclStorage);
};

export const removeAccessToken = (provider) => {
    oauthService.removeAccessToken(provider);
}
