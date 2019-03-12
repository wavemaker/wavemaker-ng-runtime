import { Injectable } from '@angular/core';

import { File } from '@ionic-native/file';

import { convertToBlob } from '@wm/core';

declare const _;

export interface IUploadResponse {
    text: string;
    response: any;
    headers: (string) => string;
}

export class UploadRequest {

    private _files = [];
    private _params = [];
    private _headers = [];

    constructor (private url: string, private cordovaFile: File) {

    }

    public addFile(name: string, path: string, filename: string): UploadRequest {
        this._files.push({
            name: name,
            path: path,
            fileName: filename
        });
        return this;
    }

    public addHeader(name: string, value: string): UploadRequest {
        this._headers.push({
            name: name,
            value: value
        });
        return this;
    }

    public addParam(name: string, value: string): UploadRequest {
        this._params.push({
            name: name,
            value: value
        });
        return this;
    }

    public post(): Promise<IUploadResponse> {
        const formData = new FormData();
        this._params.forEach( e => formData.append(e.name, e.value));
        return Promise.all(this._files.map( e => {
            if (e.path) {
                return convertToBlob(e.path)
                    .then(result => {
                        return {
                            name: e.name,
                            fileName: e.fileName,
                            blob: result.blob
                        };
                    });
            }
            return e;
        })).then(params => {
            params.forEach(e => formData.append(e.name, e.blob || e.path, e.fileName));
            return new Promise<IUploadResponse>((resolve, reject) => {
                const request = new XMLHttpRequest();
                request.open('POST', this.url);
                this._headers.forEach(e => request.setRequestHeader(e.name, e.value));
                request.onload = () => {
                    resolve({
                        headers: (name: string) => request.getResponseHeader(name),
                        response: request.response,
                        text: request.responseText as string
                    });
                };
                request.onerror = reject;
                request.onabort = reject;
                request.send(formData);
            });
        });
    }
}

@Injectable({ providedIn: 'root' })
export class DeviceFileUploadService {

    constructor(private cordovaFile: File) {}

    public upload(url: string, fileParamName: string, path: string, fileName?: string, params?: any, headers?: any): Promise<IUploadResponse> {
        const req = new UploadRequest(url, this.cordovaFile)
            .addFile(fileParamName, path, fileName);
        _.forEach(params, (k, v) => req.addParam(k, v));
        _.forEach(headers, (k, v) => req.addHeader(k, v));
        return req.post();
    }

}
