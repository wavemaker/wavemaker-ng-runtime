import { Injectable } from '@angular/core';

import { IDeviceStartUpService } from '@wm/mobile/core';

declare const _;

const STORAGE_KEY = 'wavemaker.persistedcookies';

interface CookieInfo {
    hostname: string;
    name: string;
    value: string;
}

@Injectable()
export class CookieService implements IDeviceStartUpService {

    private cookieInfo: Map<string, CookieInfo> = new Map<string, CookieInfo>();

    public serviceName = 'CookeService';

    public persistCookie(hostname: string, cookieName: string): Promise<void> {
        return new Promise((resolve, reject) => {
            window['cookieEmperor'].getCookie(hostname, cookieName, data => {
                if (data.cookieValue) {
                    this.cookieInfo[hostname + '-' + cookieName] = {
                        hostname: hostname,
                        name: cookieName,
                        value: this.rotateLTR(data.cookieValue)
                    };
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.cookieInfo));
                }
                resolve();
            }, reject);
        });
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