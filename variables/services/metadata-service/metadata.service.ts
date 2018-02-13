import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class MetadataService {
    httpClient;
    metadataMap;

    constructor(httpClient: HttpClient) {
        this.httpClient = httpClient;
    }

    isLoaded() {
        return this.metadataMap ? Object.keys(this.metadataMap).length : false;
    }

    load() {
        return new Promise((resolve, reject) => {
            this.httpClient.get('./services/servicedefs').toPromise().then((response) => {
                this.metadataMap = response;
                resolve(response);
            });
        });
    }

    getByOperationId(operationId) {
        return this.metadataMap[operationId];
    }
}
