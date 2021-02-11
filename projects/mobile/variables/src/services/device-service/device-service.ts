import { AppVersion } from '@ionic-native/app-version';
import { Device } from '@ionic-native/device';
import { Geolocation } from '@ionic-native/geolocation';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { Diagnostic } from '@ionic-native/diagnostic';
import { Vibration } from '@ionic-native/vibration';

import { $appDigest, App, isSpotcues } from '@wm/core';
import { NetworkService } from '@wm/mobile/core';
import { DeviceVariableService, IDeviceVariableOperation, initiateCallback } from '@wm/variables';
import { CurrentGeoPositionOperation } from './location-service';

declare const navigator, $;
/**
 * this file contains all device operations under 'device' service.
 */
export class DeviceService extends DeviceVariableService {
    public readonly name = 'device';
    public readonly operations: IDeviceVariableOperation[] = [];

    constructor(app: App,
        appVersion: AppVersion,
        device: Device,
        geoLocation: Geolocation,
        networkService: NetworkService,
        vibrateService: Vibration,
        locationAccuracyService: LocationAccuracy,
        diagnosticService: Diagnostic
        ) {
        super();
        this.operations.push(new AppInfoOperation(device, appVersion),
            new CurrentGeoPositionOperation(app, geoLocation, locationAccuracyService, diagnosticService),
            new DeviceInfoOperation(device),
            new GetNetworkInfoOperation(app, networkService),
            new GoOfflineOperation(networkService),
            new GoOnlineOperation(networkService),
            new VibrateOperation(vibrateService));
        app.subscribe('onNetworkStateChange', data => {
            app.networkStatus = data;
            $appDigest();
        });
        app.networkStatus = {
            isConnecting : false,
            isConnected : true,
            isNetworkAvailable : true,
            isServiceAvailable : true
        };
    }
}


/**
 * This class handles 'getAppInfo' device operation.
 */
class AppInfoOperation implements IDeviceVariableOperation {
    public readonly name = 'getAppInfo';
    public readonly model = {
        appversion: 'X.X.X',
        cordovaversion: 'X.X.X'
    };
    public readonly properties = [
        {target: 'startUpdate', type: 'boolean', value: true, hide: true}
    ];

    constructor (private device: Device, private appVersion: AppVersion) {

    }

    public invoke(variable: any, options: any): Promise<any> {
        const cordovaVersion = this.device.cordova;
        if (isSpotcues) {
            return Promise.resolve({
                appversion: window['_WM_APP_PROPERTIES']['version'],
                cordovaversion: cordovaVersion
            });
        }
        return this.appVersion.getVersionNumber().then(appVersion => {
            return {
                appversion: appVersion,
                cordovaversion: cordovaVersion
            };
        });
    }
}

/**
 * This class handles 'getDeviceInfo' device operation.
 */
class DeviceInfoOperation implements IDeviceVariableOperation {
    public readonly name = 'getDeviceInfo';
    public readonly model = {
        deviceModel: 'DEVICEMODEL',
        os: 'DEVICEOS',
        osVersion: 'X.X.X',
        deviceUUID: 'DEVICEUUID'
    };
    public readonly properties = [
        {target: 'startUpdate', type: 'boolean', value: true, hide: true}
    ];

    constructor (private device: Device) {

    }

    public invoke(variable: any, options: any): Promise<any> {
        const response = {
            'deviceModel': this.device.model,
            'os': this.device.platform,
            'osVersion': this.device.version,
            'deviceUUID': this.device.uuid
        };
        return Promise.resolve(response);
    }
}

class GetNetworkInfoOperation implements IDeviceVariableOperation {
    public readonly name = 'getNetworkInfo';
    public readonly model = {
        connectionType: 'NONE',
        isConnecting: false,
        isNetworkAvailable: true,
        isOnline: true,
        isOffline: false
    };
    public readonly properties = [
        {target: 'autoUpdate', type: 'boolean', value: true, hide : true},
        {target: 'startUpdate', type: 'boolean', value: true, hide : true},
        {target: 'networkStatus', type: 'object', value: 'bind:App.networkStatus', dataBinding: true, hide: true},
        {target: 'onOnline', hide : false},
        {target: 'onOffline', hide : false}
    ];
    public readonly requiredCordovaPlugins = ['NETWORK'];

    constructor (private app: App, private networkService: NetworkService) {

    }

    public invoke(variable: any, options: any, dataBindings: Map<string, any>): Promise<any> {
        const data = {
            connectionType: navigator.connection.type,
            isConnecting: this.app.networkStatus.isConnecting,
            isNetworkAvailable: this.app.networkStatus.isNetworkAvailable,
            isOnline: this.app.networkStatus.isConnected,
            isOffline: !this.app.networkStatus.isConnected
        };
        if (this.networkService.isConnected()) {
            initiateCallback('onOnline', variable, data);
        } else {
            initiateCallback('onOffline', variable, data);
        }
        return Promise.resolve(data);
    }
}

class GoOfflineOperation implements IDeviceVariableOperation {
    public readonly name = 'goOffline';
    public readonly model = {};
    public readonly properties = [];
    public readonly requiredCordovaPlugins = ['NETWORK'];

    constructor (private networkService: NetworkService) {

    }

    public invoke(variable: any, options: any, dataBindings: Map<string, any>): Promise<any> {
        return this.networkService.disconnect();
    }
}

class GoOnlineOperation implements IDeviceVariableOperation {
    public readonly name = 'goOnline';
    public readonly model = {};
    public readonly properties = [];
    public readonly requiredCordovaPlugins = ['NETWORK'];

    constructor (private networkService: NetworkService) {

    }

    public invoke(variable: any, options: any, dataBindings: Map<string, any>): Promise<any> {
        return this.networkService.connect();
    }
}

/**
 * This class handles 'vibrate' device operation.
 */
class VibrateOperation implements IDeviceVariableOperation {
    public readonly name = 'vibrate';
    public readonly model = {
        appversion: 'X.X.X',
        cordovaversion: 'X.X.X'
    };
    public readonly properties = [
        {target: 'vibrationtime', type: 'number', value: 2, dataBinding: true}
    ];
    public readonly requiredCordovaPlugins = ['VIBRATE'];

    constructor (private vibrationService: Vibration) {

    }

    public invoke(variable: any, options: any, dataBindings: Map<string, any>): Promise<any> {
        this.vibrationService.vibrate(dataBindings.get('vibrationtime') * 1000);
        return Promise.resolve();
    }
}
