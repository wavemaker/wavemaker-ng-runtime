import { Injectable } from '@angular/core';
import { HttpService } from '@wm/http';
import { SecurityService } from '@wm/security';

@Injectable()
export class AppResourceManagerService {

    get(url, pageName?): string | any {
        return this.$http.get(url);
    }

    constructor(private $http: HttpService, private securityService: SecurityService) {}
}