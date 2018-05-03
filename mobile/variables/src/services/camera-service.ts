import { Camera } from '@ionic-native/camera';
import { MediaCapture } from '@ionic-native/media-capture';

import { isNumber } from '@wm/core';
import { DeviceVariableService, IDeviceVariableOperation } from '@wm/variables';

export class CameraService extends DeviceVariableService {
    public readonly name = 'camera';
    public readonly operations: IDeviceVariableOperation[] = [];

    constructor(camera: Camera, mediaCapture: MediaCapture) {
        super();
        this.operations.push(new CaptureImageOperation(camera),
            new CaptureVideoOperation(mediaCapture));
    }
}

class CaptureImageOperation implements IDeviceVariableOperation {
    public readonly name = 'captureImage';
    public readonly model = {
        imagePath: 'resources/images/imagelists/default-image.png'
    };
    public readonly properties = [
            {target: 'allowImageEdit', type: 'boolean', value: false, dataBinding: true},
            {target: 'imageQuality', type: 'number', value: 80, dataBinding: true},
            {target: 'imageEncodingType', type: 'list', options: {'0': 'JPEG', '1': 'PNG'}, value: '0', dataBinding: true},
            {target: 'correctOrientation', type: 'boolean', value: true, dataBinding: true},
            {target: 'imageTargetWidth', type: 'number', dataBinding: true},
            {target: 'imageTargetHeight', type: 'number', dataBinding: true}
        ];
    public readonly requiredCordovaPlugins = ['CAMERA', 'CAPTURE'];

    constructor(private camera: Camera) {

    }

    public invoke(variable: any, options: any, dataBindings: Map<string, any>): Promise<any> {
        const imageTargetWidth = dataBindings.get('imageTargetWidth'),
            imageTargetHeight = dataBindings.get('imageTargetHeight'),
            cameraOptions = {
                quality           : dataBindings.get('imageQuality'),
                destinationType   : 1, // only file url
                sourceType        : 1, // camera
                allowEdit         : dataBindings.get('allowImageEdit'),
                encodingType      : parseInt(dataBindings.get('imageEncodingType'), 10),
                mediaType         : 0, // always picture
                correctOrientation: dataBindings.get('correctOrientation'),
                targetWidth       : isNumber(imageTargetWidth) ?  imageTargetWidth : undefined,
                targetHeight      : isNumber(imageTargetHeight) ? imageTargetHeight : undefined,
            };
        return this.camera.getPicture(cameraOptions).then( data => {
            return {imagePath: data};
        });
    }
}

class CaptureVideoOperation implements IDeviceVariableOperation {
    public readonly name = 'captureVideo';
    public readonly model = {
        videoPath: ''
    };
    public readonly properties = [];
    public readonly requiredCordovaPlugins = ['CAMERA', 'CAPTURE'];

    constructor(private mediaCapture: MediaCapture) {

    }

    public invoke(variable: any, options: any): Promise<any> {
        return this.mediaCapture.captureVideo({
            limit : 1
        }).then( data => {
            return {videoPath: data[0].fullPath};
        });
    }
}