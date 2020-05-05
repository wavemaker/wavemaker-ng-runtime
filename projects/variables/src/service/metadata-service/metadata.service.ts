import { Injectable } from '@angular/core';

import { AbstractHttpService, hasCordova, isSpotcues } from '@wm/core';

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
        if (hasCordova() && !isSpotcues) {
            url = 'metadata/' + (prefabName ? `prefabs/${prefabName}/` : 'app/') + 'service-definitions.json';
        } else {
            url = './services/' + (prefabName ? `prefabs/${prefabName}/` : '') + 'servicedefs';
        }
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
