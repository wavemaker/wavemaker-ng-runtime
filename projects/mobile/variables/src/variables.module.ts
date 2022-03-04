import { NgModule } from '@angular/core';

import { AppVersionOriginal as AppVersion } from '@awesome-cordova-plugins/app-version';
import { BarcodeScannerOriginal as BarcodeScanner } from '@awesome-cordova-plugins/barcode-scanner';
import { CalendarOriginal as Calendar } from '@awesome-cordova-plugins/calendar';
import { CameraOriginal as Camera } from '@awesome-cordova-plugins/camera';
import { DeviceOriginal as Device } from '@awesome-cordova-plugins/device';
import { MediaCaptureOriginal as MediaCapture } from '@awesome-cordova-plugins/media-capture';
import { GeolocationOriginal as Geolocation } from '@awesome-cordova-plugins/geolocation';
import { VibrationOriginal as Vibration } from '@awesome-cordova-plugins/vibration';
import { LocationAccuracyOriginal as LocationAccuracy } from '@awesome-cordova-plugins/location-accuracy';
import { DiagnosticOriginal as Diagnostic } from '@awesome-cordova-plugins/diagnostic';

import { App } from '@wm/core';
import { DeviceFileOpenerService, DeviceFileUploadService, NetworkService, Contacts } from '@wm/mobile/core';
import { ChangeLogService, LocalDBManagementService, LocalDBDataPullService, OfflineModule } from '@wm/mobile/offline';
import { SecurityService } from '@wm/security';
import { DeviceVariableManager, VARIABLE_CONSTANTS, VariableManagerFactory } from '@wm/variables';

import { CalendarService } from './services/calendar-service';
import { CameraService } from './services/camera-service';
import { FileService } from './services/file-service';
import { DatasyncService } from './services/datasync-service';
import { DeviceService } from './services/device-service/device-service';
import { ContactsService } from './services/contacts-service';
import { ScanService } from './services/scan-service';
import { FileSelectorService, ProcessManagementService } from '@wm/mobile/components/basic';

@NgModule({
    imports: [
        OfflineModule
    ],
    declarations: [],
    providers: [
        // add providers to mobile-runtime module.
    ]
})
export class VariablesModule {

    private static initialized = false;
    // Device variable services have to be added only once in the app life-cycle.
    private static initialize(app: App,
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
                              vibrateService: Vibration,
                              locationAccuracyService: LocationAccuracy,
                              diagnosticService: Diagnostic) {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        const deviceVariableManager = VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.DEVICE) as DeviceVariableManager;
        deviceVariableManager.registerService(new CameraService(camera, mediaCapture));
        deviceVariableManager.registerService(new CalendarService(calendar));
        deviceVariableManager.registerService(new FileService(fileOpener, fileUploader));
        deviceVariableManager.registerService(new ContactsService(contacts));
        deviceVariableManager.registerService(new DatasyncService(app, changeLogService, fileSelectorService, localDBManagementService, localDBDataPullService, processManagementService, securityService, networkService));
        deviceVariableManager.registerService(new DeviceService(app, appVersion, device, geoLocation, networkService, vibrateService, locationAccuracyService, diagnosticService));
        deviceVariableManager.registerService(new ScanService(barcodeScanner));
    }

    constructor(
        app: App,
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
        vibrateService: Vibration,
        locationAccuracyService: LocationAccuracy,
        diagnosticService: Diagnostic
    ) {
        VariablesModule.initialize(app,
                                    appVersion,
                                    barcodeScanner,
                                    changeLogService,
                                    calendar,
                                    contacts,
                                    camera,
                                    fileOpener,
                                    fileSelectorService,
                                    fileUploader,
                                    device,
                                    geoLocation,
                                    localDBDataPullService,
                                    localDBManagementService,
                                    mediaCapture,
                                    processManagementService,
                                    securityService,
                                    networkService,
                                    vibrateService,
                                    locationAccuracyService,
                                    diagnosticService);
    }
}
