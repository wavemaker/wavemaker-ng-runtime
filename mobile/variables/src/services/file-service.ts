import { isValidWebURL } from '@wm/core';
import { DeviceFileOpenerService, DeviceFileUploadService } from '@wm/mobile/core';
import { $rootScope, DeviceVariableService, IDeviceVariableOperation } from '@wm/variables';

declare const _;

export class FileService extends DeviceVariableService {
    name = 'file';
    operations: IDeviceVariableOperation[] = [];

    constructor(fileOpener: DeviceFileOpenerService, fileUploader: DeviceFileUploadService) {
        super();
        this.operations.push(new OpenFileOperation(fileOpener),
            new UploadFileOperation(fileUploader));
    }
}

class OpenFileOperation implements IDeviceVariableOperation {

    private _defaultFileTypesToOpen = {
        'doc' : {'label' : 'Microsoft Office Word Document', 'mimeType' : 'application/msword', 'extension' : 'doc'},
        'pdf' : {'label' : 'PDF Document', 'mimeType' : 'application/pdf', 'extension' : 'pdf'},
        'ppt' : {'label' : 'Microsoft Office Powerpoint', 'mimeType' : 'application/vnd.ms-powerpoint', 'extension' : 'ppt'},
        'xls' : {'label' : 'Microsoft Office Excel', 'mimeType' : 'application/vnd.ms-excel', 'extension' : 'xls'}
    };

    public readonly name = 'openFile';
    public readonly model = {};
    public readonly properties = [
        {target: 'filePath', type: 'string', value: '', dataBinding: true},
        {target: 'fileType', type: 'list', options: _.mapValues(this._defaultFileTypesToOpen, 'label'),  value: 'pdf', dataBinding: true},
        {target: 'spinnerContext', hide : false},
        {target: 'spinnerMessage', hide : false}
    ];
    public readonly requiredCordovaPlugins = [];

    constructor(private fileOpener: DeviceFileOpenerService) {}

    public invoke(variable: any, options: any, dataBindings: Map<string, any>): Promise<any> {
        const fileType = this._defaultFileTypesToOpen[dataBindings.get('fileType')];
        let filePath = dataBindings.get('filePath');
        // if relative path is given, then append url with deployedUrl, to access files in resources.
        if (!isValidWebURL(filePath)) {
            filePath = $rootScope.project.deployedUrl + filePath;
        }
        return this.fileOpener.openRemoteFile(filePath, fileType.mimeType, fileType.extension);
    }
}

class UploadFileOperation implements IDeviceVariableOperation {

    public readonly name = 'upload';
    public readonly model = {
        fileName    : '',
        path        : '',
        length      : 0,
        success     : false,
        inlinePath  : '',
        errorMessage: '',
        inProgress  : false,
        loaded      : 0
    };
    public readonly properties = [
        {target: 'localFile', type: 'string', value: '', dataBinding: true},
        {target: 'remoteFolder', type: 'string', value: '', dataBinding: true},
        {target: 'onProgress', hide : false},
        {target: 'spinnerContext', hide : false},
        {target: 'spinnerMessage', hide : false}
    ];
    public readonly requiredCordovaPlugins = [];

    constructor(private fileUploader: DeviceFileUploadService) {}

    public invoke(variable: any, options: any, dataBindings: Map<string, any>): Promise<any> {
        const serverUrl = $rootScope.project.deployedUrl + 'services/file/uploadFile?relativePath=' + (dataBindings.get('remoteFolder') || ''),
            filePath = dataBindings.get('localFile'),
            fileName = filePath.split('/').pop(),
            data = {
                fileName    : fileName,
                fileSize    : 0,
                inProgress  : true,
                length      : 0,
                loaded      : 0
            };
        return this.fileUploader.upload(serverUrl, 'files', filePath, fileName)
            .post()
            .then(uploadResponse => {
                _.assignIn(data, JSON.parse(uploadResponse.text)[0]);
                data.loaded = data.length;
                return data;
            });
    }
}