import { oauthService } from './variable/variables.utils';

export const performAuthorization = (url, providerId, onSuccess, onError) => {
    oauthService.perfromOAuthorization(url, providerId, onSuccess, onError);
};

export const getAccessToken = (provider, checkLoaclStorage) => {
    return oauthService.getAccessToken(provider, checkLoaclStorage);
};

export const removeAccessToken = (provider) => {
    oauthService.removeAccessToken(provider);
}
