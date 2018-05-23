import { NgModule } from '@angular/core';

import { AppVersion } from '@ionic-native/app-version';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Calendar } from '@ionic-native/calendar';
import { Camera } from '@ionic-native/camera';
import { Device } from '@ionic-native/device';
import { Contacts } from '@ionic-native/contacts';
import { MediaCapture } from '@ionic-native/media-capture';
import { Geolocation } from '@ionic-native/geolocation';
import { Vibration } from '@ionic-native/vibration';

import { DeviceVariableManager, VARIABLE_CONSTANTS, VariableManagerFactory } from '@wm/variables';

import { CalendarService } from './services/calendar-service';
import { CameraService } from './services/camera-service';
import { DeviceService } from './services/device-service';
import { ContactsService } from './services/contacts-service';
import { ScanService } from './services/scan-service';

@NgModule({
    imports: [],
    declarations: [],
    providers: []
})
export class VariablesModule {

    constructor(appVersion: AppVersion,
                barcodeScanner: BarcodeScanner,
                calendar: Calendar,
                contacts: Contacts,
                camera: Camera,
                device: Device,
                geoLocation: Geolocation,
                mediaCapture: MediaCapture,
                vibrateService: Vibration) {
        const deviceVariableManager = VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.DEVICE) as DeviceVariableManager;
        deviceVariableManager.registerService(new CameraService(camera, mediaCapture));
        deviceVariableManager.registerService(new CalendarService(calendar));
        deviceVariableManager.registerService(new ContactsService(contacts));
        deviceVariableManager.registerService(new DeviceService(appVersion, device, geoLocation, vibrateService));
        deviceVariableManager.registerService(new ScanService(barcodeScanner));
    }
}
