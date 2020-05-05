import { Injectable } from '@angular/core';

import { Observable, Subject } from 'rxjs';

import { AbstractHttpService } from '@wm/core';

import { getAccessToken, performAuthorization, removeAccessToken } from './oAuth.utils';

declare const _;

@Injectable()
export class OAuthService {
    constructor(private httpService: AbstractHttpService) {}

    providers = new Subject();

    providersConfig = [];

    getOAuthProvidersAsObservable(): Observable<any> {
        return this.providers.asObservable();
    }

    addProviderConfig(provider) {
        if (!(_.find(this.providersConfig, {'name' : provider.name}))) {
            this.providersConfig.push(provider);
        }
        this.providers.next(this.providersConfig);
    }

    removeProviderConfig(providerId) {
        _.remove(this.providersConfig, provider => provider.name === providerId);
        this.providers.next(this.providersConfig);
    }

    perfromOAuthorization(url, providerId, onSuccess, onError, securityObj?) {
        performAuthorization(url, providerId, onSuccess, onError, this.httpService, this.addProviderConfig.bind(this), this.removeProviderConfig.bind(this), securityObj);
    }

    getAccessToken(provider, checkLocalStorage) {
        return getAccessToken(provider, checkLocalStorage);
    }

    removeAccessToken(provider) {
        removeAccessToken(provider);
    }
}
