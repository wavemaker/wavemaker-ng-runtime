import { Injectable } from '@angular/core';

import { AbstractHttpService, hasCordova } from '@wm/core';

@Injectable()
export class MetadataService {
    metadataMap: Map<string, any>;
    CONTEXT_APP = 'app';

    constructor(private $http: AbstractHttpService) {}

    isLoaded() {
        return this.metadataMap ? this.metadataMap.has(this.CONTEXT_APP) : false;
    }

    load(prefabName?: string): Promise<any> {
        let url;
        if (hasCordova()) {
            url = 'metadata/' + (prefabName ? `prefabs/${prefabName}/` : 'app/') + 'service-definitions.json';
        } else {
            url = './services/' + (prefabName ? `prefabs/${prefabName}/` : '') + 'servicedefs';
        }
        return new Promise((resolve, reject) => {
            this.$http.send({'url' : url, 'method': 'GET'}).then((response) => {
                this.metadataMap = this.metadataMap || new Map();
                this.metadataMap.set(prefabName || this.CONTEXT_APP, response.body);
                resolve(response.body);
            }, reject);
        });
    }

    getByOperationId(operationId, context) {
        context = context || this.CONTEXT_APP;
        const map = this.metadataMap.get(context);
        return map && map[operationId];
    }
}
