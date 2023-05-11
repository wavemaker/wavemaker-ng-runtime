import { oauthService, appManager } from './variable/variables.utils';
export var performAuthorization = function (url, providerId, onSuccess, onError, securityObj) {
    oauthService === null || oauthService === void 0 ? void 0 : oauthService.perfromOAuthorization(url, providerId, onSuccess, onError, securityObj, appManager.getCustomUrlScheme(), appManager.getDeployedURL());
};
export var getAccessToken = function (provider, checkLoaclStorage) {
    return (oauthService === null || oauthService === void 0 ? void 0 : oauthService.getAccessToken) && oauthService.getAccessToken(provider, checkLoaclStorage);
};
export var removeAccessToken = function (provider) {
    oauthService.removeAccessToken(provider);
};
//# sourceMappingURL=oAuth.utils.js.map