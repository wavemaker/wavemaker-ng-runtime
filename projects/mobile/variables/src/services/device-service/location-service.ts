import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { Geolocation, GeolocationOptions } from '@ionic-native/geolocation';
import { Diagnostic } from '@ionic-native/diagnostic';

import { IDeviceVariableOperation } from '@wm/variables';
import { $appDigest, App, isAndroid, isIos, isSpotcues, getAndroidVersion} from '@wm/core';

declare const cordova;
const PERMISSION_DENIED_ONCE = "DENIED_ONCE";

/**
 * This class handles 'getCurrentGeoPosition' device operation.
 */
export class CurrentGeoPositionOperation implements IDeviceVariableOperation {
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
        {target: 'geolocationTimeout', type: 'number', value: 5, dataBinding: true},
    ];
    public readonly requiredCordovaPlugins = ['GEOLOCATION'];

    private lastKnownPosition;
    private waitingQueue = [];
    private watchId;
    private locationRequestedAlready = false;
    
    private previousPermissionStatus;
    private currentPermissionStatus;

    private options = {
        maximumAge: 3000,
        timeout: (2 * 60) * 1000,
        enableHighAccuracy: true
    };

    constructor (private app: App, private geoLocation: Geolocation, private locationAccuracyService: LocationAccuracy, private diagnosticService: Diagnostic) {}

    private watchPosition() {
        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
        const options = window['WM_GEO_LOCATION_OPTIONS'] || this.options;
        this.watchId = navigator.geolocation.watchPosition(position => {
            this.lastKnownPosition = {
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
            if (this.waitingQueue.length > 0) {
                this.waitingQueue.forEach(fn => fn(this.lastKnownPosition));
                this.waitingQueue.length = 0;
            }
            $(document).off('touchend.usergesture');
        }, () => {
            this.watchId = null;
        }, options);
    }

    private geoLocationService(variable: any, options: any, dataBindings: Map<string, any>): Promise<any> {
        if (!this.watchId || !this.lastKnownPosition) {
            this.watchPosition();
            $(document).on('touchend.usergesture', () => this.watchPosition());
        }
        const geoLocationOptions: GeolocationOptions = {
            maximumAge: dataBindings.get('geolocationMaximumAge') * 1000,
            timeout: dataBindings.get('geolocationTimeout') * 1000,
            enableHighAccuracy: dataBindings.get('geolocationHighAccuracy')
        };
        if (this.lastKnownPosition) {
            return Promise.resolve(this.lastKnownPosition);
        }
        return new Promise(resolve => {
            const c = position => {
                resolve(position);
            };
            setTimeout(() => {
                const index = this.waitingQueue.indexOf(c);
                if (index > -1) {
                    this.waitingQueue.splice(index, 1);
                    resolve(this.model);
                }
            }, this.options.timeout);
            this.waitingQueue.push(c);
        });        
    }

    private requestLocationService(variable: any, options: any, dataBindings: Map<string, any>): Promise<any> {
        //Request to turn on location services
        return this.locationAccuracyService.canRequest()
        .then((canRequest: boolean) => {
                if(canRequest && !this.locationRequestedAlready) {
                //In iOS, Only once location service request can be made, Repeated access will be blocked by OS 
                //https://github.com/dpa99c/cordova-plugin-request-location-accuracy#ios-cancel-button-caveat
                    this.locationRequestedAlready = isIos();
                    return this.locationAccuracyService.request(this.locationAccuracyService.REQUEST_PRIORITY_HIGH_ACCURACY)
                }else {
                    if(isIos() && confirm(this.app.appLocale.MESSAGE_REQUEST_LOCATION_PERMISSION)){
                        this.diagnosticService.switchToSettings();
                        return Promise.reject();
                    }
                    return Promise.resolve();
                }            
            })
            .then(() => { 
                return this.geoLocationService(variable, options, dataBindings)                        
            })
            .catch((e) => {    
                if (e && e.code && e.code !== this.locationAccuracyService.ERROR_USER_DISAGREED) {
                    if(confirm(this.app.appLocale.MESSAGE_REQUEST_LOCATION_PERMISSION)){
                        this.diagnosticService.switchToSettings();
                    }
                }   
                return Promise.resolve(this.lastKnownPosition ? this.lastKnownPosition : this.model);    
            });
    }

    private handleLocationAuthorizationStatus(variable: any, options: any, dataBindings: Map<string, any>, permissionStatus: string): Promise<any> {        
        this.previousPermissionStatus = this.currentPermissionStatus;
        this.currentPermissionStatus = permissionStatus;
            switch(permissionStatus){            
                case this.diagnosticService.permissionStatus.GRANTED_WHEN_IN_USE:
                case this.diagnosticService.permissionStatus.GRANTED:{
                    return this.onLocationGranted(variable, options, dataBindings);                    
                }
                case PERMISSION_DENIED_ONCE:{
                    return this.requestLocationService(variable, options, dataBindings);
                }
                case this.diagnosticService.permissionStatus.DENIED_ALWAYS:{
                    if(isIos()){
                        //iOS Location Service Turned Off returns DENIED_ALWAYS
                        return this.requestLocationService(variable, options, dataBindings);
                    }else{
                        if(confirm(this.app.appLocale.MESSAGE_REQUEST_LOCATION_PERMISSION)){
                            this.diagnosticService.switchToSettings();
                        }
                        return Promise.resolve(this.model);
                    }
                }
                case this.diagnosticService.permissionStatus.NOT_REQUESTED: {
                    return this.requestLocationAuthorization(variable, options, dataBindings);
                }                           
            }
    }

    private requestLocationAuthorization(variable: any, options: any, dataBindings: Map<string, any>): Promise<any>{
        return this.diagnosticService.requestLocationAuthorization()
            .then((permissionStatus) => {
                return this.handleLocationAuthorizationStatus(variable, options, dataBindings, permissionStatus)
            })
    }

    private requestLocationAccuracy(variable: any, options: any, dataBindings: Map<string, any>): Promise<any>{
        return this.diagnosticService.getLocationAuthorizationStatus()
            .then((permissionStatus) => {
                return this.handleLocationAuthorizationStatus(variable, options, dataBindings, permissionStatus)                
            })
            .catch((e) => {   
                //In case of device older than Android 6, Due to absence of API fallback.
                return this.geoLocationService(variable, options, dataBindings);
            });
    }

    private onLocationGranted(variable: any, options: any, dataBindings: Map<string, any>): Promise<any>{
        //iOS updates 'Granted' Only if Location service is turned On
        //Android updates 'Granted' even if Location service is turned Off
        if(isIos()){
            return this.geoLocationService(variable, options, dataBindings)                        
        }else if(isAndroid() && parseInt(getAndroidVersion(), 10) <= 10 
            && this.previousPermissionStatus === PERMISSION_DENIED_ONCE 
            && this.currentPermissionStatus === this.diagnosticService.permissionStatus.GRANTED_WHEN_IN_USE){
                location.reload();
            return this.requestLocationService(variable, options, dataBindings);
        }else{
            return this.requestLocationService(variable, options, dataBindings);
        }
    }

    private onLocationGrantedAndroid(variable: any, options: any, dataBindings: Map<string, any>): Promise<any>{
        return this.requestLocationService(variable, options, dataBindings);
    }



    public invoke(variable: any, options: any, dataBindings: Map<string, any>): Promise<any> {
        if(cordova['plugins'] && cordova['plugins']['locationAccuracy']){
            return this.requestLocationAccuracy(variable, options, dataBindings);
        }else{
            return this.geoLocationService(variable, options, dataBindings);                        
        }
    }
}