import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isMobileApp } from '@wm/core';

@Injectable()
export class MetadataService {
    httpClient;
    metadataMap: Map<string, any>;
    CONTEXT_APP: string = 'app';

    constructor(httpClient: HttpClient) {
        this.httpClient = httpClient;
    }

    isLoaded() {
        return this.metadataMap ? this.metadataMap.has(this.CONTEXT_APP) : false;
    }

    load(prefabName?: string): Promise<any> {
        let url;
        if (isMobileApp()) {
            url = 'metadata/' + (prefabName ? `prefabs/${prefabName}/` : 'app/') + 'service-definitions.json';
        } else {
            url = './services/' + (prefabName ? `prefabs/${prefabName}/` : '') + 'servicedefs';
        }
        return new Promise((resolve, reject) => {
            this.httpClient.get(url).toPromise().then((response) => {
                this.metadataMap = this.metadataMap || new Map();
                this.metadataMap.set(prefabName || this.CONTEXT_APP, response);
                resolve(response);
            }, reject);
        });
    }

    getByOperationId(operationId, context) {
        context = context || this.CONTEXT_APP;
        const map = this.metadataMap.get(context);
        return map && map[operationId];
    }
}
