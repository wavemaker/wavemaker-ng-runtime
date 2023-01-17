import {ChangeDetectorRef, Component, ElementRef, HostListener, Injector, Optional} from '@angular/core';

import { Camera } from '@awesome-cordova-plugins/camera/ngx';
import { MediaCapture } from '@awesome-cordova-plugins/media-capture/ngx';

import { APPLY_STYLES_TYPE, IWidgetConfig, provideAsWidgetRef, StylableComponent, styler } from '@wm/components/base';
import {convertToBlob, hasCordova, UserDefinedExecutionContext} from '@wm/core';

import { registerProps } from './camera.props';

const DEFAULT_CLS = 'btn app-camera';
const WIDGET_CONFIG: IWidgetConfig = {widgetType: 'wm-camera', hostClass: DEFAULT_CLS};

export enum CAPTURE_TYPE {
    IMAGE = 'IMAGE',
    PNG = 'PNG'
}

export enum ENCODING_TYPE {
    JPEG = 'JPEG',
    PNG = 'PNG'
}

@Component({
    selector: 'button[wmCamera]',
    templateUrl: './camera.component.html',
    providers: [
        provideAsWidgetRef(CameraComponent)
    ],
    exportAs: 'wmCamera'
})
export class CameraComponent extends StylableComponent {
    static initializeProps = registerProps();
    public allowedit: boolean;
    public correctorientation: boolean;
    public capturetype: string;
    public datavalue: string;
    public imagequality: number;
    public imageencodingtype: string;
    public imagetargetwidth: number;
    public imagetargetheight: number;
    public localFile: any;
    public localFilePath: string;
    public savetogallery: boolean;
    public iconsize: any;
    public iconclass: any;

    private _cameraOptions: any;

    constructor(private camera: Camera, private mediaCapture: MediaCapture, inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef, @Optional() public _viewParent: UserDefinedExecutionContext) {
        super(inj, WIDGET_CONFIG, _viewParent);
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.SCROLLABLE_CONTAINER);
    }

    @HostListener('click', ['$event'])
    public openCamera($event) {
        if (hasCordova()) {
            if (this.capturetype === CAPTURE_TYPE.IMAGE) {
                this._cameraOptions = {
                    quality           : this.imagequality,
                    destinationType   : 1, // 0-data url,1- file url
                    sourceType        : 1, // only camera
                    allowEdit         : this.allowedit,
                    correctOrientation: this.correctorientation,
                    encodingType      : this.imageencodingtype === ENCODING_TYPE.JPEG ? 0 : 1,
                    saveToPhotoAlbum  : this.savetogallery,
                    targetWidth       : this.imagetargetwidth,
                    targetHeight      : this.imagetargetheight
                };
                // start camera
                this.camera.getPicture(this._cameraOptions)
                    .then(path => this.updateModel($event, path));
            } else {
                this._cameraOptions = {
                    limit: 1
                };
                // start video capture
                this.mediaCapture.captureVideo(this._cameraOptions)
                    .then(mediaFiles => this.updateModel($event, mediaFiles[0].fullPath));
            }
        } else {
            this.invokeEventCallback('success', {$event});
        }
    }

    private updateModel($event, value) {
        value = (value.startsWith('file://') ? '' : 'file://') + value;
        this.localFilePath = this.datavalue = value;
        convertToBlob(value)
            .then(result => {
                this.localFile = result.blob;
                this.invokeEventCallback('success', {$event, localFilePath: this.localFilePath, localFile: this.localFile});
            }, () => {
                this.localFile = undefined;
            });
    }
}
