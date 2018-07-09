import { NgModule } from '@angular/core';

import { AppVersion } from '@ionic-native/app-version';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Calendar } from '@ionic-native/calendar';
import { Camera } from '@ionic-native/camera';
import { Contacts } from '@ionic-native/contacts';
import { File } from '@ionic-native/file';
import { FileOpener } from '@ionic-native/file-opener';
import { Device } from '@ionic-native/device';
import { MediaCapture } from '@ionic-native/media-capture';
import { Geolocation } from '@ionic-native/geolocation';
import { Network } from '@ionic-native/network';
import { Vibration } from '@ionic-native/vibration';


import { hasCordova } from '@wm/core';


import { DeviceFileCacheService } from './services/device-file-cache.service';
import { DeviceFileDownloadService } from './services/device-file-download.service';
import { DeviceFileOpenerService } from './services/device-file-opener.service';
import { DeviceFileService } from './services/device-file.service';
import { DeviceFileUploadService } from './services/device-file-upload.service';
import { DeviceService } from './services/device.service';
import { ExtAppMessageService } from './services/ext-app-message.service';
import { NetworkService } from './services/network.service';

const ionicServices = [
    AppVersion,
    BarcodeScanner,
    Calendar,
    Camera,
    Contacts,
    File,
    FileOpener,
    Device,
    Geolocation,
    MediaCapture,
    Network,
    Vibration
];

@NgModule({
    declarations: [],
    imports: [],
    providers: [
        DeviceFileDownloadService,
        DeviceFileCacheService,
        DeviceFileOpenerService,
        DeviceFileService,
        DeviceFileUploadService,
        DeviceService,
        ExtAppMessageService,
        NetworkService,
        ...ionicServices
    ],
    bootstrap: []
})
export class MobileCoreModule {

    constructor(deviceService: DeviceService,
                deviceFileService: DeviceFileService,
                fileCacheService: DeviceFileCacheService,
                fileOpener: DeviceFileOpenerService,
                networkService: NetworkService) {
        if (hasCordova()) {
            deviceService.addStartUpService(deviceFileService);
            deviceService.addStartUpService(fileCacheService);
            deviceService.addStartUpService(fileOpener);
            deviceService.addStartUpService(networkService);
        }
    }
}