import { AppVersion } from '@ionic-native/app-version';
import { Device } from '@ionic-native/device';
import { Geolocation, GeolocationOptions } from '@ionic-native/geolocation';
import { Vibration } from '@ionic-native/vibration';

import { $appDigest, App } from '@wm/core';
import { NetworkService } from '@wm/mobile/core';
import { DeviceVariableService, IDeviceVariableOperation, initiateCallback } from '@wm/variables';

declare const navigator;
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
        vibrateService: Vibration) {
        super();
        this.operations.push(new AppInfoOperation(device, appVersion),
            new CurrentGeoPositionOperation(geoLocation),
            new DeviceInfoOperation(device),
            new GetNetworkInfoOperation(app, networkService),
            new GoOfflineOperation(networkService),
            new GoOnlineOperation(networkService),
            new VibrateOperation(vibrateService));
        app.subscribe('onNetworkStateChange', data => {
            app['$root'].networkStatus = data;
            $appDigest();
        });
        app.networkStatus = {
            isConnecting : false,
            isConnected : true,
            isNetworkAvailable : true,
            isServiceAvailable : true
        };
        app['$root'] = app['$root'] || {};
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
        return this.appVersion.getVersionNumber().then(appVersion => {
            return {
                appversion: appVersion,
                cordovaversion: cordovaVersion
            };
        });
    }
}

/**
 * This class handles 'getCurrentGeoPosition' device operation.
 */
class CurrentGeoPositionOperation implements IDeviceVariableOperation {
    public readonly name = 'getCurrentGeoPosition';
    public readonly model = {
        coords: {
            latitude: 0,
            longitude: 0,
            altitude: 0,
            accuracy: 0,
            altitudeAccuracy: 0,
            heading: 0,
            speed: 0
        },
        timestamp: 0
    };
    public readonly properties = [
        {target: 'startUpdate', type: 'boolean', value: true, hide : true},
        {target: 'autoUpdate', type: 'boolean', value: true, hide : true},
        {target: 'geolocationHighAccuracy', type: 'boolean', value: true, dataBinding: true},
        {target: 'geolocationMaximumAge', type: 'number', value: 3, dataBinding: true},
        {target: 'geolocationTimeout', type: 'number', value: 5, dataBinding: true}
    ];
    public readonly requiredCordovaPlugins = ['GEOLOCATION'];

    constructor (private geoLocation: Geolocation) {

    }

    public invoke(variable: any, options: any, dataBindings: Map<string, any>): Promise<any> {
        const geoLocationOptions: GeolocationOptions = {
            maximumAge: dataBindings.get('geolocationMaximumAge') * 1000,
            timeout: dataBindings.get('geolocationTimeout') * 1000,
            enableHighAccuracy: dataBindings.get('geolocationHighAccuracy')
        };
        return this.geoLocation.getCurrentPosition(geoLocationOptions)
            .then(position => {
                return {
                    coords: {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        altitude: position.coords.altitude,
                        accuracy: position.coords.accuracy,
                        altitudeAccuracy: position.coords.altitudeAccuracy,
                        heading: position.coords.heading,
                        speed: position.coords.speed
                    },
                    timestamp: position.timestamp
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
        {target: 'networkStatus', type: 'boolean', value: 'bind:$root.networkStatus', dataBinding: true, hide: true},
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