import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpRequest, HttpResponse } from '@angular/common/http';

declare const _;

@Injectable()
export class HttpService {
    httpClient: HttpClient;
    nonBodyTypeMethods = ['GET', 'DELETE', 'HEAD', 'OPTIONS', 'JSONP'];

    constructor(httpClient: HttpClient) {
        this.httpClient = httpClient;
    }

    send(options: any) {
        let reqHeaders = new HttpHeaders(),
            reqParams = new HttpParams();
        const headers = options.headers;
        const params = options.params;
        const responseType = options.responseType;

        // TODO[VIBHU]: not to be sent with non-proxy calls from service var
        reqHeaders.append('X-Requested-With', 'XMLHttpRequest');

        // headers
        if (headers) {
            Object.entries(headers).forEach(([k, v]) =>
                reqHeaders = reqHeaders.append(k, v));
        }

        // params
        if (params) {
            Object.entries(params).forEach(([k, v]) =>
                reqParams = reqParams.append(k, v));
        }

        let third, fourth;
        const reqOptions = {
            headers: reqHeaders,
            params: reqParams,
            responseType: responseType
        };
        if (_.includes(this.nonBodyTypeMethods, options.method.toUpperCase())) {
            third = reqOptions;
            fourth = null;
        } else {
            third = options.data;
            fourth = reqOptions;
        }

        const req = new HttpRequest(options.method, options.url, third, fourth);

        return this.httpClient.request(req).toPromise();
    }

    get(url: string, options?: any) {
        options = options || {};
        options.url = url;
        options.method = 'get';
        return this.send(options).then((response: HttpResponse<string>) => response.body);
    }

    post(url, data, options) {
        options = options || {};
        options.url = url;
        options.method = 'post';
        return this.send(options);
    }
}