import { DeviceVariableService, IDeviceVariableOperation, initiateCallback } from '@wm/variables';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { Geolocation, GeolocationOptions } from '@ionic-native/geolocation';
import { Diagnostic } from '@ionic-native/diagnostic';
const PERMISSION_DENIED_ONCE = "DENIED_ONCE";
const PERMISSION_TEXT = "Would you like to switch to the Location Settings page and enable permission manually?";
import { window as operator } from 'rxjs/operators';

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
        {target: 'geolocationRequestDialogText', type: 'string', value: "", dataBinding: true}
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

    constructor (private geoLocation: Geolocation, private locationAccuracyService: LocationAccuracy, private diagnosticService: Diagnostic) {}

    private watchPosition() {
        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
        const options = operator['WM_GEO_LOCATION_OPTIONS'] || this.options;
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
        return new Promise(resolve => {            
            this.locationAccuracyService.canRequest().then((canRequest: boolean) => {
                if(canRequest) {
                // the accuracy option will be ignored by iOS
                    this.locationAccuracyService.request(this.locationAccuracyService.REQUEST_PRIORITY_HIGH_ACCURACY).then(
                        () => {
                            this.geoLocationService(variable, options, dataBindings)
                             .then((value) => resolve(value));
                        },
                        error => {                        
                            resolve(this.model);
                        }
                    );
                }else{
                    if(confirm(PERMISSION_TEXT)){
                        this.diagnosticService.switchToSettings();
                    }
                }            
            });
        });
    }    

    private handleLocationAuthorizationStatus(variable: any, options: any, dataBindings: Map<string, any>, permissionStatus: string): Promise<any> {
        return new Promise(resolve => {            
            switch(permissionStatus){            
                case this.diagnosticService.permissionStatus.GRANTED:
                case PERMISSION_DENIED_ONCE:
                case this.diagnosticService.permissionStatus.DENIED_ALWAYS:
                case this.diagnosticService.permissionStatus.GRANTED_WHEN_IN_USE: {
                    this.makeRequest(variable, options, dataBindings)
                    .then((value) => resolve(value));
                    break;
                }
                case this.diagnosticService.permissionStatus.NOT_REQUESTED: {
                    this.requestLocationAuthorization(variable, options, dataBindings)
                    .then((value) => resolve(value));
                    break;
                }                           
            }
        });
    }

    private requestLocationAuthorization(variable: any, options: any, dataBindings: Map<string, any>): Promise<any>{
        return new Promise(resolve => {            
            this.diagnosticService.requestLocationAuthorization()
            .then((permissionStatus) => {
                this.handleLocationAuthorizationStatus(variable, options, dataBindings, permissionStatus)
                .then((value) => resolve(value));
                }).catch(e => console.error(e));
        });
    }

    private requestLocationAccuracy(variable: any, options: any, dataBindings: Map<string, any>): Promise<any>{
        return new Promise(resolve => {            
            this.diagnosticService.getLocationAuthorizationStatus()
            .then((permissionStatus) => {
                this.handleLocationAuthorizationStatus(variable, options, dataBindings, permissionStatus)
                .then((value) => resolve(value));
                }).catch(e => console.error(e));
        });
    }

    public invoke(variable: any, options: any, dataBindings: Map<string, any>): Promise<any> {
        return new Promise(resolve => {
            this.requestLocationAccuracy(variable, options, dataBindings)
            .then((value) => resolve(value));
        });
    }
}