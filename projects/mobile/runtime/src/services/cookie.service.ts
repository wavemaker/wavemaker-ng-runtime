import { Injectable } from '@angular/core';

import { IDeviceStartUpService } from '@wm/mobile/core';

declare const _;

const STORAGE_KEY = 'wavemaker.persistedcookies';

interface CookieInfo {
    hostname: string;
    name: string;
    value: string;
}

@Injectable({
    providedIn: 'root'
})
export class CookieService implements IDeviceStartUpService {

    private cookieInfo = {};

    public serviceName = 'CookeService';

    public persistCookie(hostname: string, cookieName: string, cookieValue?: string): Promise<void> {
        return new Promise<string>(resolve => {
                if (cookieValue) {
                    resolve(cookieValue);
                } else {
                    this.getCookie(hostname, cookieName)
                        .then(data => resolve(data.cookieValue));
                }
            }).then(value => {
                this.cookieInfo[hostname + '-' + cookieName] = {
                    hostname: hostname.replace(/:[0-9]+/, ''),
                    name: cookieName,
                    value: this.rotateLTR(value)
                };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.cookieInfo));
            });
    }

    public getCookie(hostname: string, cookieName: string): Promise<any> {
        return new Promise<void>((resolve, reject) => {
            window['cookieEmperor'].getCookie(hostname, cookieName, resolve, reject);
        });
    }

    public setCookie(hostname: string, cookieName: string, cookieValue: string): Promise<any> {
        return new Promise<void>((resolve, reject) => {
            window['cookieEmperor'].setCookie(hostname, cookieName, cookieValue, resolve, reject);
        });
    }

    public clearAll(): Promise<any> {
        return new Promise<any>((resolve, reject) => window['cookieEmperor'].clearAll(resolve, reject));
    }

    /**
     * Loads persisted cookies from local storage and adds them to the browser.
     * @returns {*}
     */
    public start(): Promise<any> {
        const cookieInfoStr = localStorage.getItem(STORAGE_KEY),
            promises = [];
        if (cookieInfoStr) {
            const cookieInfo = JSON.parse(cookieInfoStr) as Map<string, CookieInfo>;
            _.forEach(cookieInfo, c => {
                if (c.name && c.value) {
                    const promise = new Promise((resolve, reject) => {
                        window['cookieEmperor'].setCookie(c.hostname, c.name, this.rotateRTL(c.value), resolve, reject);
                    });
                    promises.push(promise);
                }
            });
        }
        return Promise.all(promises);
    }

    /**
     * Just rotates the given string exactly from 1/3 of string length in left to right direction.
     * @param str
     * @returns {string}
     */
    private rotateLTR(str: string): string {
        const arr = str.split(''),
            tArr = [],
            shift = Math.floor(str.length / 3);
        arr.forEach((v, i) => {
            tArr[(i + shift) % arr.length] = arr[i];
        });
        return tArr.join('');
    }

    /**
     * Just rotates the given string exactly from 1/3 of string length in  right to left direction..
     * @param str
     * @returns {string}
     */
    private rotateRTL(str: string): string {
        const arr = str.split(''),
            tArr = [],
            shift = Math.floor(str.length / 3);
        arr.forEach((v, i) => {
            tArr[(arr.length + i - shift) % arr.length] = arr[i];
        });
        return tArr.join('');
    }
}
