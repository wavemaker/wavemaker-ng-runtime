import { NgModule } from '@angular/core';

import { AppVersion } from '@ionic-native/app-version';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Calendar } from '@ionic-native/calendar';
import { Camera } from '@ionic-native/camera';
import { Contacts } from '@ionic-native/contacts';
import { File } from '@ionic-native/file';
import { Device } from '@ionic-native/device';
import { MediaCapture } from '@ionic-native/media-capture';
import { Geolocation } from '@ionic-native/geolocation';
import { Network } from '@ionic-native/network';
import { Vibration } from '@ionic-native/vibration';


import { hasCordova } from '@wm/core';

import { DeviceService } from './services/device.service';
import { DeviceFileService } from './services/device-file.service';

const ionicServices = [
    AppVersion,
    BarcodeScanner,
    Calendar,
    Camera,
    Contacts,
    File,
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
        DeviceFileService,
        DeviceService,
        ...ionicServices
    ],
    bootstrap: []
})
export class MobileCoreModule {

    constructor(deviceService: DeviceService, deviceFileService: DeviceFileService) {
        if (hasCordova()) {
            deviceService.addStartUpService(deviceFileService);
        }
    }
}