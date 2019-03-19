import { NgModule } from '@angular/core';

import { hasCordova } from '@wm/core';

import { DeviceFileCacheService } from './services/device-file-cache.service';
import { DeviceFileOpenerService } from './services/device-file-opener.service';
import { DeviceFileService } from './services/device-file.service';
import { DeviceService } from './services/device.service';
import { NetworkService } from './services/network.service';

@NgModule({
    declarations: [],
    imports: [],
    providers: [
        // add providers to mobile-runtime module.
    ],
    bootstrap: []
})
export class MobileCoreModule {

    constructor(
        deviceService: DeviceService,
        deviceFileService: DeviceFileService,
        fileCacheService: DeviceFileCacheService,
        fileOpener: DeviceFileOpenerService,
        networkService: NetworkService
    ) {
        deviceService.addStartUpService(networkService);
        if (hasCordova()) {
            deviceService.addStartUpService(deviceFileService);
            deviceService.addStartUpService(fileCacheService);
            deviceService.addStartUpService(fileOpener);
        }
    }
}
