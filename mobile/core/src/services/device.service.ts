import {Injectable} from '@angular/core';

import { IDeviceStartUpService } from './device-start-up-service';
import { hasCordova } from '@wm/core';

@Injectable()
export class DeviceService {

    private _isReady = false;
    private _whenReadyPromises = [];
    private _backBtnTapListeners = [];
    private _startUpServices: IDeviceStartUpService[] = [];

    public constructor() {
        const maxWaitTime = 10;
        setTimeout(() => {
            if (this._isReady) {
                console.warn(`Device is not ready even after ${maxWaitTime} seconds`);
                console.warn('Waiting For %O', this._startUpServices.map(i => i.serviceName));
            }
        }, maxWaitTime * 1000);
        document.addEventListener('backbutton', ($event) => {
            this._backBtnTapListeners.every(fn => {
                return fn($event) !== false;
            });
        });
    }

    public addStartUpService(service: IDeviceStartUpService) {
        this._startUpServices.push(service);
    }

    public onBackButtonTap(fn: ($event) => boolean) {
        this._backBtnTapListeners.unshift(fn);
        return () => {
            const i = this._backBtnTapListeners.indexOf(fn);
            if (i >= 0) {
                this._backBtnTapListeners.splice(i, 1);
            }
        };
    }

    public start() {
        if (this._isReady || this._startUpServices.length === 0) {
            this._isReady = true;
            return Promise.resolve();
        } else {
            return new Promise((resolve) => {
                if (hasCordova()) {
                    document.addEventListener('deviceready', () => resolve(), false);
                } else {
                    resolve();
                }
            }).then(() => {
                return Promise.all(this._startUpServices.map(s => s.start()));
            }).then(() => {
                this._startUpServices.length = 0;
                this._whenReadyPromises.forEach(i => i());
                this._isReady = true;
            });
        }
    }

    public whenReady(): Promise<void> {
        if (this._isReady) {
            return Promise.resolve();
        } else {
            return new Promise<void>((resolve) => {
                this._whenReadyPromises.push(resolve);
            });
        }
    }
}