import { NgModule } from '@angular/core';

import { hasCordova, isIos } from '@wm/core';

import { DeviceFileCacheService } from './services/device-file-cache.service';
import { DeviceFileOpenerService } from './services/device-file-opener.service';
import { DeviceFileService } from './services/device-file.service';
import { DeviceService } from './services/device.service';
import { NetworkService, overrideXHROpen } from './services/network.service';
import { NativeXMLHttpREquest } from './native.xhr';

declare const cordova;

@NgModule({
    declarations: [],
    imports: [],
    providers: [
        // add providers to mobile-runtime module.
    ],
    bootstrap: []
})
export class MobileCoreModule {
    static initialized = false;
    // Startup services have to be added only once in the app life-cycle.
    static addStartupServices(deviceService: DeviceService,
                      deviceFileService: DeviceFileService,
                      fileCacheService: DeviceFileCacheService,
                      fileOpener: DeviceFileOpenerService,
                      networkService: NetworkService) {
        if (this.initialized) {
            return;
        }
        deviceService.addStartUpService(networkService);
        if (hasCordova()) {
            deviceService.addStartUpService(deviceFileService);
            deviceService.addStartUpService(fileCacheService);
            deviceService.addStartUpService(fileOpener);
        }
        this.initialized = true;
    }

    constructor(
        deviceService: DeviceService,
        deviceFileService: DeviceFileService,
        fileCacheService: DeviceFileCacheService,
        fileOpener: DeviceFileOpenerService,
        networkService: NetworkService
    ) {
        MobileCoreModule.addStartupServices(deviceService, deviceFileService, fileCacheService, fileOpener, networkService);
        if (isIos() && hasCordova() && cordova.plugin && cordova.plugin.http) {
            document.addEventListener("wmDeviceReady", () => {
                window['XMLHttpRequest'] = NativeXMLHttpREquest;
                overrideXHROpen(NativeXMLHttpREquest);
                this.overrideResolveLocalFileSystemURL();
            }, false);
        } else {
            overrideXHROpen(XMLHttpRequest);
        }
    }

    private overrideResolveLocalFileSystemURL() {
        const or = window['resolveLocalFileSystemURL'];
        window['resolveLocalFileSystemURL'] = (path, onSuccess, onError) => {
            if (path && path.startsWith('http://localhost')) {
                path = new URL(path).pathname;
                const lf = '/local-filesystem';
                if (path.startsWith(lf)) {
                    path = 'file://' + path.substring(lf.length);
                }
            }
            or.call(window, path, onSuccess, onError);
        };
    }
}
