import { AppVersion } from '@ionic-native/app-version';
import { Device } from '@ionic-native/device';
import { Geolocation, GeolocationOptions } from '@ionic-native/geolocation';
import { Vibration } from '@ionic-native/vibration';

import { DeviceVariableService, IDeviceVariableOperation } from '@wm/variables';
/**
 * this file contains all device operations under 'device' service.
 */
export class DeviceService extends DeviceVariableService {
    public readonly name = 'device';
    public readonly operations: IDeviceVariableOperation[] = [];

    constructor(appVersion: AppVersion, device: Device, geoLocation: Geolocation, vibrateService: Vibration) {
        super();
        this.operations.push(new AppInfoOperation(device, appVersion),
            new CurrentGeoPositionOperation(geoLocation),
            new DeviceInfoOperation(device),
            new VibrateOperation(vibrateService));
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