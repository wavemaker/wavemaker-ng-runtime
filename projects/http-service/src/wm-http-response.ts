import { WmHttpRequest } from './wm-http-request';
import { HttpResponse } from '@angular/common/http';


declare const _;

/**
 * This class creates a custom WmHttpRequest.
 */
export class WmHttpResponse extends WmHttpRequest{

    error: any;
    message: string;
    ok: boolean;
    status: number;
    statusText: string;

    constructor() {
        super();
    }

    /**
     * This method converts the given wm HttpResponse to angular HttpResponse
     * @param respObj, the wm HttpResponse
     */
    wmToAngularResponse(respObj) {
        let angResp;
        angResp = new HttpResponse();
        angResp = angResp.clone();
        angResp.body = respObj.body;
        angResp.error = respObj.error;
        angResp.message = respObj.message;
        angResp.url = respObj.url;
        angResp.ok = respObj.ok;
        angResp.status = respObj.status;
        angResp.statusText = respObj.statusText;
        respObj.headers.forEach((value, header)=>{
            angResp.headers = angResp.headers.append(header, value);
        });
        return angResp;
    }

    /**
     * This method converts the given wm HttpResponse to angular HttpResponse
     * @param respObj, the angular HttpResponse
     */
    angularToWmResponse(respObj) {
        let wmResp;
        let headerMap = new Map();
        wmResp = new WmHttpResponse();
        wmResp.body = respObj.body;
        wmResp.error = respObj.error;
        wmResp.message = respObj.message;
        wmResp.url = respObj.url;
        wmResp.ok = respObj.ok;
        wmResp.status = respObj.status;
        wmResp.statusText = respObj.statusText;
        respObj.headers.keys().forEach((header) => {
            headerMap.set(header, respObj.headers.headers.get(header.toLowerCase())[0]);
        });
        wmResp.headers = headerMap;
        return wmResp;
    }
}