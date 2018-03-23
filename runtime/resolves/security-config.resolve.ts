import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { SecurityService } from './../services/security.service';

@Injectable()
export class SecurityConfigResolve implements Resolve<any> {

    constructor(private securityService: SecurityService) {}

    resolve() {
        return this.securityService.isLoaded() || this.securityService.load();
    }
}
