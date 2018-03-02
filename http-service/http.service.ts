declare const _;
import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable()
export class HttpService {
    httpClient: HttpClient;
    nonBodyTypeMethods = ['GET', 'DELETE', 'HEAD', 'OPTIONS', 'JSONP'];

    constructor(httpClient: HttpClient) {
        this.httpClient = httpClient;
    }

    get(url: string, options: any) {
        return this.httpClient.get(url, options).toPromise();
    }

    post(url, data, options) {
        return this.httpClient.post(url, data, options).toPromise();
    }

    doGet(options: any) {
        let url = options.url;
        return this.get(url, options);
    }

    doPost(options: any) {
        let url = options.url,
            data = options.data;
        return this.post(url, data, options);
    }

    send(options: any) {
        let reqHeaders = new HttpHeaders();
        let reqParams = new HttpParams();
        const headers = options.headers;
        const params = options.params;
        for (let h in headers) {
            reqHeaders = reqHeaders.append(h, headers[h]);
        }
        reqHeaders = reqHeaders.append('testHeader', 'test Header Value');
        for (let p in params) {
            reqParams = reqParams.append(p, params[p]);
        }
        let third, fourth, reqOptions = {
            headers: reqHeaders,
            params: reqParams
        };
        if (_.includes(this.nonBodyTypeMethods, options.method)) {
            third = reqOptions;
            fourth = null;
        } else {
            third = options.data;
            fourth = reqOptions;
        }
        let req = new HttpRequest(options.method, options.url, third, fourth );

        return this.httpClient.request(req).toPromise();
    }
}