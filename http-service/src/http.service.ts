import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpRequest, HttpResponse, HttpXsrfTokenExtractor } from '@angular/common/http';
import { Subject } from 'rxjs/Subject';

declare const _;

@Injectable()
export class HttpService {
    nonBodyTypeMethods = ['GET', 'DELETE', 'HEAD', 'OPTIONS', 'JSONP'];
    sessionTimeoutObservable = new Subject();

    constructor(private httpClient: HttpClient) {}

    send(options: any) {
        let reqHeaders = new HttpHeaders(),
            reqParams = new HttpParams();
        const headers = options.headers;
        const params = options.params;
        const responseType = options.responseType;

        // TODO[VIBHU]: not to be sent with non-proxy calls from service variable
        reqHeaders = reqHeaders.append('X-Requested-With', 'XMLHttpRequest');

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
        if (_.includes(this.nonBodyTypeMethods, options.method && options.method.toUpperCase())) {
            third = reqOptions;
            fourth = null;
        } else {
            third = options.data;
            fourth = reqOptions;
        }

        const req = new HttpRequest(options.method, options.url, third, fourth);

        // const observable = this.httpClient.request(req);

        return new Promise((resolve, reject) => {
            this.httpClient.request(req).toPromise().then((response) => {
                resolve(response);
            } , (error) => {
                if (error.status === 401) {
                    this.on401();
                }
                reject(error);
            });
        });
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

    /**
     * registers a callback to be trigerred on session timeout
     * @param callback
     */
    registerOnSessionTimeout(callback) {
        this.sessionTimeoutObservable.asObservable().subscribe(callback)
    }

    /**
     * trigger the registered methods on session timeout
     */
    on401() {
        this.sessionTimeoutObservable.next();
    }
}