import { Injectable } from '@angular/core';

import {_WM_APP_PROJECT, AbstractHttpService} from '@wm/core';
declare const _WM_APP_PROPERTIES;

@Injectable()
export class MetadataService {
    metadataMap: Map<string, any>;
    providerMap: Map<string, any>;
    CONTEXT_APP = 'app';

    constructor(private $http: AbstractHttpService) {}

    isLoaded() {
        return this.metadataMap ? this.metadataMap.has(this.CONTEXT_APP) : false;
    }

    load(prefabName?: string): Promise<any> {
        let url;
            let serviceDefFileName = prefabName ? prefabName + '-prefab-servicedefs.json'  : 'app-servicedefs.json'
            const deployedUrl = _WM_APP_PROJECT.cdnUrl + 'servicedefs/' + serviceDefFileName;

            const previewUrl = './services/' + (prefabName ? `prefabs/${prefabName}/` : '') + 'servicedefs';
            url = _WM_APP_PROJECT.isPreview || _WM_APP_PROPERTIES?.serviceDefSources === 'DYNAMIC' ? previewUrl : deployedUrl;
        return new Promise((resolve, reject) => {
            this.$http.send({'url' : url, 'method': 'GET'}).then((response) => {
                this.metadataMap = this.metadataMap || new Map();
                this.providerMap = this.providerMap || new Map();
                response.body = response.body || {};
                this.metadataMap.set(prefabName || this.CONTEXT_APP, response.body.serviceDefs);
                if (response.body.securityDefinitions) {
                    this.providerMap.set(prefabName || this.CONTEXT_APP, response.body.securityDefinitions.oauthProvider);
                }
                resolve(response.body.serviceDefs);
            }, reject);
        });
    }

    getByOperationId(operationId, context) {
        context = context || this.CONTEXT_APP;
        const map = this.metadataMap.get(context);
        return map && map[operationId];
    }

    // function to get Provider details from providerMap for the passed providerId
    getByProviderId(providerId, context) {
        context = context || this.CONTEXT_APP;
        const map = this.providerMap.get(context);
        return map && map[providerId];
    }

    getByCrudId(crudId, context) {
        context = context || this.CONTEXT_APP;
        const map = this.metadataMap.get(context);
        let ops = [];
        for (let k in map) {
            if (map[k] && map[k].crudOperationId === crudId) {
                ops.push(map[k]);
            }
        }
        return ops;
    }
}
