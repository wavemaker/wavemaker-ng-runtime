import { oauthService, appManager } from './variable/variables.utils';
export var performAuthorization = function (url, providerId, onSuccess, onError, securityObj) {
    oauthService.perfromOAuthorization(url, providerId, onSuccess, onError, securityObj, appManager.getCustomUrlScheme(), appManager.getDeployedURL());
};
export var getAccessToken = function (provider, checkLoaclStorage) {
    return oauthService.getAccessToken(provider, checkLoaclStorage);
};
export var removeAccessToken = function (provider) {
    oauthService.removeAccessToken(provider);
};
//# sourceMappingURL=oAuth.utils.js.map