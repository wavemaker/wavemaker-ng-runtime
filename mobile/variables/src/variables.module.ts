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

import { App } from '@wm/core';
import { DeviceFileOpenerService, DeviceFileUploadService, NetworkService } from '@wm/mobile/core';
import { ChangeLogService, LocalDBManagementService, LocalDBDataPullService, OfflineModule } from '@wm/mobile/offline';
import { SecurityService } from '@wm/security';
import { DeviceVariableManager, VARIABLE_CONSTANTS, VariableManagerFactory } from '@wm/variables';

import { CalendarService } from './services/calendar-service';
import { CameraService } from './services/camera-service';
import { FileService } from './services/file-service';
import { DatasyncService } from './services/datasync-service';
import { DeviceService } from './services/device-service';
import { ContactsService } from './services/contacts-service';
import { ScanService } from './services/scan-service';
import { FileSelectorService, ProcessManagementService } from '@wm/mobile/components';

@NgModule({
    imports: [
        OfflineModule
    ],
    declarations: [],
    providers: []
})
export class VariablesModule {

    constructor(app: App,
                appVersion: AppVersion,
                barcodeScanner: BarcodeScanner,
                changeLogService: ChangeLogService,
                calendar: Calendar,
                contacts: Contacts,
                camera: Camera,
                fileOpener: DeviceFileOpenerService,
                fileSelectorService: FileSelectorService,
                fileUploader: DeviceFileUploadService,
                device: Device,
                geoLocation: Geolocation,
                localDBDataPullService: LocalDBDataPullService,
                localDBManagementService: LocalDBManagementService,
                mediaCapture: MediaCapture,
                processManagementService: ProcessManagementService,
                securityService: SecurityService,
                networkService: NetworkService,
                vibrateService: Vibration) {
        const deviceVariableManager = VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.DEVICE) as DeviceVariableManager;
        deviceVariableManager.registerService(new CameraService(camera, mediaCapture));
        deviceVariableManager.registerService(new CalendarService(calendar));
        deviceVariableManager.registerService(new FileService(fileOpener, fileUploader));
        deviceVariableManager.registerService(new ContactsService(contacts));
        deviceVariableManager.registerService(new DatasyncService(app, changeLogService, fileSelectorService, localDBManagementService, processManagementService, securityService, networkService, localDBDataPullService));
        deviceVariableManager.registerService(new DeviceService(app, appVersion, device, geoLocation, networkService, vibrateService));
        deviceVariableManager.registerService(new ScanService(barcodeScanner));
    }
}
