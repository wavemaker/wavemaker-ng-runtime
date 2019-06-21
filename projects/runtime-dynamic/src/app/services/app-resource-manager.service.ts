import { Injectable } from '@angular/core';

import { AbstractHttpService, App } from '@wm/core';

const cache = new Map<string, string>();

@Injectable()
export class AppResourceManagerService {

    get(url: string, useCache?: boolean): string | any {
        const cachedResponse = cache.get(url);

        if (cachedResponse) {
            return Promise.resolve(cachedResponse);
        }

        return this.$http.get(url).then(response => {
            if (useCache) {
                cache.set(url, response);
            }
            return response;
        });
    }

    public clearCache() {
        cache.clear();
    }

    constructor(private $http: AbstractHttpService) {}
}
