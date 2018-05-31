import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { HttpService } from '@wm/http';
import { performAuthorization, removeAccessToken, getAccessToken } from './oAuth.utils';

declare const _;

@Injectable()
export class OAuthService {
    constructor(private httpService: HttpService) {}

    providers = new Subject();

    providersConfig = [];

    getOAuthProvidersAsObservable() {
        return this.providers.asObservable();
    }

    addProviderConfig(provider) {
        this.providersConfig.push(provider);
        this.providers.next(this.providersConfig);
    }

    removeProviderConfig(providerId) {
        _.remove(this.providersConfig, provider => provider.name === providerId);
        this.providers.next(this.providersConfig);
    }

    perfromOAuthorization(url, providerId, onSuccess, onError) {
        performAuthorization(url, providerId, onSuccess, onError, this.httpService, this.addProviderConfig.bind(this), this.removeProviderConfig.bind(this));
    }

    getAccessToken(provider, checkLocalStorage) {
        return getAccessToken(provider, checkLocalStorage);
    }

    removeAccessToken(provider) {
        removeAccessToken(provider);
    }
}