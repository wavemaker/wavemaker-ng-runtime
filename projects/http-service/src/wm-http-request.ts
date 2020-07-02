import { HttpRequest } from '@angular/common/http';

declare const _;

/**
 * This class creates a custom WmHttpRequest.
 */
export class WmHttpRequest {

    method: string;
    url: string;
    headers: any = [];
    responseType: string;
    reportProgress: boolean;
    withCredentials: boolean;
    urlWithParams: string;
    body: any;

    constructor() {}

    /**
     * This method converts the given wm HttpRequest to angular HttpRequest
     * @param reqObj, the wm HttpRequest
     */
    wmToAngularRequest(reqObj) {
        let angReq;
        angReq = new HttpRequest(reqObj.method, reqObj.url);
        angReq = angReq.clone();
        angReq.body = reqObj.body;
        angReq.method = reqObj.method;
        angReq.responseType =  reqObj.responseType;
        angReq.reportProgress = reqObj.reportProgress;
        angReq.urlWithParams = reqObj.url;
        angReq.withCredentials =  reqObj.withCredentials;
        reqObj.headers.forEach((value, header) => {
            angReq.headers = angReq.headers.append(header, value);
        });
        return angReq;
    }

    /**
     * This method converts the given angular HttpRequest to wm HttpRequest
     * @param req, the angular HttpRequest
     */
    angularToWmRequest(req) {
        let wmReq = new WmHttpRequest();
        let headerMap = new Map();
        wmReq.body = req.body;
        wmReq.method = req.method;
        wmReq.responseType = req.responseType;
        wmReq.reportProgress = req.reportProgress;
        wmReq.url = req.urlWithParams;
        wmReq.withCredentials = req.withCredentials;
        req.headers.keys().forEach((header) => {
            headerMap.set(header, req.headers.headers.get(header.toLowerCase())[0]);
        });
        wmReq.headers = headerMap;
        return wmReq;
    }
}
