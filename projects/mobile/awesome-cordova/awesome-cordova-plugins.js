import * as AppVersion from '../../../node_modules/@awesome-cordova-plugins/app-version/ngx/index.js';
import * as BarcodeScanner from '../../../node_modules/@awesome-cordova-plugins/barcode-scanner/ngx/index.js';
import * as Calendar from '../../../node_modules/@awesome-cordova-plugins/calendar/ngx/index.js';
import * as Camera from '../../../node_modules/@awesome-cordova-plugins/camera/ngx/index.js';
import * as Device from '../../../node_modules/@awesome-cordova-plugins/device/ngx/index.js';
import * as File from '../../../node_modules/@awesome-cordova-plugins/file/ngx/index.js';
import * as FileOpener from '../../../node_modules/@awesome-cordova-plugins/file-opener/ngx/index.js';
import * as GeoLocation from '../../../node_modules/@awesome-cordova-plugins/geolocation/ngx/index.js';
import * as MediaCapture from '../../../node_modules/@awesome-cordova-plugins/media-capture/ngx/index.js';
import * as Network from '../../../node_modules/@awesome-cordova-plugins/network/ngx/index.js';
import * as Sqlite from '../../../node_modules/@awesome-cordova-plugins/sqlite/ngx/index.js';
import * as Vibration from '../../../node_modules/@awesome-cordova-plugins/vibration/ngx/index.js';
import * as LocationAccuracy from '../../../node_modules/@awesome-cordova-plugins/location-accuracy/ngx/index.js';
import * as Diagnostic from '../../../node_modules/@awesome-cordova-plugins/diagnostic/ngx/index.js';

export default {
    ...AppVersion,
    ...BarcodeScanner,
    ...Calendar,
    ...Camera,
    ...Device,
    ...File,
    ...FileOpener,
    ...GeoLocation,
    ...MediaCapture,
    ...Network,
    ...Sqlite,
    ...Vibration,
    ...LocationAccuracy,
    ...Diagnostic
};