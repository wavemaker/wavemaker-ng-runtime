import {Injectable} from '@angular/core';

@Injectable()
export class DeviceService {

    constructor() {

    }

    waitForInitialization(name: string) {
        return () => {};
    }

}