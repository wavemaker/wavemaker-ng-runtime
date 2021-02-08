import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { Geolocation, GeolocationOptions } from '@ionic-native/geolocation';
import { Diagnostic } from '@ionic-native/diagnostic';

import { IDeviceVariableOperation } from '@wm/variables';
import { $appDigest, App, isSpotcues } from '@wm/core';

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

    private makeRequest(variable: any, options: any, dataBindings: Map<string, any>): Promise<any> {
        return this.locationAccuracyService.canRequest()
        .then((canRequest: boolean) => {
                if(canRequest) {
                // the accuracy option will be ignored by iOS
                    return this.locationAccuracyService.request(this.locationAccuracyService.REQUEST_PRIORITY_HIGH_ACCURACY)
                } else {                    
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
                return Promise.resolve(this.model);    
            });
    }    

    private handleLocationAuthorizationStatus(variable: any, options: any, dataBindings: Map<string, any>, permissionStatus: string): Promise<any> {        
        console.log(permissionStatus)
            switch(permissionStatus){            
                case this.diagnosticService.permissionStatus.GRANTED_WHEN_IN_USE:
                case this.diagnosticService.permissionStatus.GRANTED:
                case PERMISSION_DENIED_ONCE:{
                    return this.makeRequest(variable, options, dataBindings);
                }
                case this.diagnosticService.permissionStatus.DENIED_ALWAYS:{
                    if(confirm(this.app.appLocale.MESSAGE_REQUEST_LOCATION_PERMISSION || 'Would you like to switch to the Location Settings page and enable permission manually?')){
                        this.diagnosticService.switchToSettings();
                    }
                    return Promise.reject(this.model);
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
    }

    public invoke(variable: any, options: any, dataBindings: Map<string, any>): Promise<any> {
        return this.requestLocationAccuracy(variable, options, dataBindings);
    }
}