import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class AppResourceManagerService {

    get(url) {
        return this.$http.get(url).toPromise();
    }

    constructor(private $http: HttpClient) {}
}