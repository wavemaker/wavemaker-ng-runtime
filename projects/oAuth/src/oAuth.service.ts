import { Injectable } from '@angular/core';

import { Observable, Subject } from 'rxjs';

import { AbstractHttpService } from '@wm/core';

import { getAccessToken, performAuthorization, removeAccessToken } from './oAuth.utils';
import {find, remove} from "lodash-es";

@Injectable()
export class OAuthService {
    constructor(private httpService: AbstractHttpService) {}

    providers = new Subject();

    providersConfig: any = [];

    getOAuthProvidersAsObservable(): Observable<any> {
        return this.providers.asObservable();
    }

    addProviderConfig(provider) {
        if (!(find(this.providersConfig, {'name': provider.name}))) {
            this.providersConfig.push(provider);
        }
        this.providers.next(this.providersConfig);
    }

    removeProviderConfig(providerId) {
        remove<any>(this.providersConfig, provider => provider.name === providerId);
        this.providers.next(this.providersConfig);
    }

    perfromOAuthorization(url, providerId, onSuccess, onError, securityObj?, customUriScheme?, deployedURL?) {
        performAuthorization(url, providerId, onSuccess, onError, this.httpService, this.addProviderConfig.bind(this), this.removeProviderConfig.bind(this), securityObj, customUriScheme, deployedURL);
    }

    getAccessToken(provider, checkLocalStorage) {
        return getAccessToken(provider, checkLocalStorage);
    }

    removeAccessToken(provider) {
        removeAccessToken(provider);
    }
}
