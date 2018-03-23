import { Injectable } from '@angular/core';
import { HttpService } from '@http-service/http.service';
import { SecurityService } from './security.service';

@Injectable()
export class AppResourceManagerService {

    get(url, pageName?): string | any {
        return this.$http.get(url).catch(e => {
            if (e.status === 401) {
                this.securityService.handle401(pageName);
            }
            return Promise.reject('error loading the app resource');
        });
    }

    constructor(private $http: HttpService, private securityService: SecurityService) {}
}