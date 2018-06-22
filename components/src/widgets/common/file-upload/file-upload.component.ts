import { Attribute, Component, Injector, OnInit } from '@angular/core';
import { isAudioFile, isImageFile, isVideoFile } from '@wm/core';
import { registerProps } from './file-upload.props';
import { BaseComponent } from '../base/base.component';
import { Subject } from 'rxjs/Subject';

declare const _;

registerProps();
const DEFAULT_CLS = 'app-fileupload input-group';
const WIDGET_CONFIG = {widgetType: 'wm-fileupload', hostClass: DEFAULT_CLS};

@Component({
    selector: '[wmFileUpload]',
    templateUrl: './file-upload.component.html'
})

export class FileUploadComponent extends BaseComponent implements OnInit {

    selectedFiles = {};
    progressObservable;
    name;
    multiple;
    fileTransfers = {};
    caption = 'Upload';
    formName = '';
    maxfilesize;
    selectedUploadTypePath;
    DEFAULT_CAPTIONS = {
        'MULTIPLE_SELECT'   : 'Drop your files here.',
        'SELECT'            : 'Select'
    };
    DEVICE_CONTENTTYPES = {
        'IMAGE'   : 'image',
        'VIDEO'   : 'video',
        'AUDIO'   : 'audio',
        'FILES'   : 'files'
    };
    FILESIZE_MB = 1048576;
    widgetProps;
    _isMobileType;
    _isCordova;
    // parentPrefabScope = element.closest('.app-prefab').isolateScope(),
    CONSTANT_FILE_SERVICE = 'FileService';
    uploadData = {
        file: undefined,
        uploadPath: undefined
    };
    chooseFilter = '';
    datasource;
    fileUploadMessage = 'You can also browse for files';
    uploadedFiles = {
        'fileName': '',
        'path': '',
        'length': '',
        'status': ''
    };
    /*_hasOnSuccessEvt = WM.isDefined(attrs.onSuccess);
    _hasOnErrorEvt = WM.isDefined(attrs.onError);*/

    // Checking if the selected file is valid for the choosen filter type
    isValidFile(filename, contenttype, extensionName, isMobileType) {
    let isValid,
        contentTypes;
    if (!contenttype) {
        return true;
    }
    contentTypes = _.toLower(contenttype).split(',');

    if (_.includes(contentTypes, 'image/*') || (_.includes(contentTypes, 'image') && isMobileType)) {
        isValid = isImageFile(filename);
        // If one of the content type chosen is image and user uploads image it is valid file
        if (isValid) {
            return isValid;
        }
    }
    if (_.includes(contentTypes, 'audio/*') || (_.includes(contentTypes, 'audio') && isMobileType)) {
        isValid = isAudioFile(filename);
        // If one of the content type chosen is audio/* and user uploads audio it is valid file
        if (isValid) {
            return isValid;
        }
    }
    if (_.includes(contentTypes, 'video/*') || (_.includes(contentTypes, 'video') && isMobileType)) {
        isValid = isVideoFile(filename);
        // If one of the content type chosen is video/* and user uploads video it is valid file
        if (isValid) {
            return isValid;
        }
    }
    /*content type and the uploaded file extension should be same*/
    if (_.includes(contentTypes, '.' + _.toLower(extensionName))) {
        isValid = true;
    }
    return isValid;
}

    /* this return the array of files which are having the file size not more than maxfilesize and filters based on contenttype */
    getValidFiles($files) {
    const validFiles = [],
        MAXFILEUPLOAD_SIZE = parseInt(this.maxfilesize, 10) * this.FILESIZE_MB || this.FILESIZE_MB,
        MAX_FILE_UPLOAD_FORMATTED_SIZE = (this.maxfilesize || '100') + 'MB';

    // if contenttype is files for mobile projects.
    if (this.chooseFilter === this.DEVICE_CONTENTTYPES.FILES) {
        this.chooseFilter = '';
    }

    _.forEach($files, (file) => {
        /* check for the file content type before uploading */
        if (!this.isValidFile(file.name, this.chooseFilter, this.getFileExtension(file.name), this._isMobileType)) {
            // triggerFn(scope.onError);
            // Todo:[Shubham] wmToaster.show('error', 'Expected a ' + this.chooseFilter + ' file'); Use a consolelog fr nw
            console.error('Expected a ' + this.chooseFilter + ' file');
            return;
        }
        if (file.size > MAXFILEUPLOAD_SIZE) {
            // triggerFn(scope.onError);
            // Todo[Shubham] wmToaster.show('error', 'File size exceeded limit. Max upload size is ' + MAX_FILE_UPLOAD_FORMATTED_SIZE);
            console.error('File size exceeded limit. Max upload size is ' + MAX_FILE_UPLOAD_FORMATTED_SIZE);
            return;
        }
        validFiles.push(file);
    });
    return validFiles;
}

    /*Overwrite the caption only if they are default*/
    getCaption(caption, isMultiple, isMobileType) {
        if (_.includes(this.DEFAULT_CAPTIONS, caption)) {
            return isMultiple && !isMobileType ? this.DEFAULT_CAPTIONS.MULTIPLE_SELECT : this.DEFAULT_CAPTIONS.SELECT;
        }
        return caption;
    }

    uploadUrl = 'services';

    /* change server path based on user option */
    changeServerUploadPath (path) {
        this.selectedUploadTypePath = path;
    }

    // Todo[Shubham]: Need this only in mobile
    /* if (CONSTANTS.hasCordova) {
        openFileSelector{
        var uploadOptions = {formName: scope.formName};

        // open the imagepicker view if contenttype is image.
        if (scope.contenttype === DEVICE_CONTENTTYPES.IMAGE) {
            DeviceMediaService.imagePicker(scope.multiple).then(function (files) {
                scope.onFileSelect({}, files);
            });
            return;
        }

        // open the audiopicker view if contenttype is image.
        if (scope.contenttype === DEVICE_CONTENTTYPES.AUDIO) {
            DeviceMediaService.audioPicker(scope.multiple).then(function (files) {
                scope.onFileSelect({}, files);
            });
            return;
        }

        //// open the videopicker view if contenttype is image.
        if (scope.contenttype === DEVICE_CONTENTTYPES.VIDEO && Utils.isIphone()) {
            DeviceMediaService.videoPicker().then(function (files) {
                scope.onFileSelect({}, files);
            });
            return;
        }

        // open the file selector if contenttype is files.
        FileSelectorService.open({multiple: scope.multiple}, function (files) {
            scope.onFileSelect({}, files);
        });
    }
    }*/

    /* this function returns the fileextension */
    getFileExtension (fileName) {
        if (fileName && _.includes(fileName, '.')) {
            return fileName.substring(fileName.lastIndexOf('.') + 1);
        }
        return 'file';
    }

    /*this function to append upload status dom elements to widget */
    onFileSelect ($event, $files) {
        const uploadOptions = { formName : this.formName};
        let fileParamCount = 0;
        $files = this.getValidFiles($files);
        this.selectedFiles = $files;
        this.progressObservable = new Subject();
        if (this.datasource) {
            this.datasource._progressObservable = this.progressObservable;
            this.datasource._progressObservable.asObservable().subscribe((progressObj) => {
                _.forEach(this.selectedFiles, (file) => {
                    if (file.name === progressObj.fileName) {
                        file.progress = progressObj.progress;
                        if (file.progress === 100) {
                            file.status = 'success';
                        } else {
                            file.status = progressObj.status;
                        }
                    }
                });
            });
            if (this.datasource.dataBinding) {
                _.forEach(this.datasource.dataBinding, (dataBinding) => {
                    _.forEach(dataBinding, (dataObj) => {
                        if (dataObj instanceof File) {
                            fileParamCount++;
                        }
                    });
                });
                if (fileParamCount === 1) {
                    setTimeout(() => {
                        this.datasource.invoke();
                    }, 1000);
                } else {
                    setTimeout(() => {
                        this.invokeEventCallback('select', {
                            $event: $.extend($event.$files || {}, $files)
                        });
                    }, 1000);
                }
            } else {
                setTimeout(() => {
                    this.invokeEventCallback('select', {
                        $event: $.extend($event.$files || {}, $files)
                    });
                }, 1000);
            }
        }
    }

    /* Define the property change handler. This function will be triggered when there is a change in the widget property */
    onPropertyChange(key, nv, ov) {
    /*Monitoring changes for styles or properties and accordingly handling respective changes.*/
    switch (key) {
        case 'uploadpath':
            // BOYINA: why do we need uploadpath
            this.changeServerUploadPath(nv);
            break;
        case 'contenttype':
            this.chooseFilter = nv.split(' ').join(',');
            break;
        case 'multiple':
            this.formName = this.name + (this.multiple ? '-multiple-fileupload' : '-single-fileupload');
            this.caption = this.getCaption(this.caption, this.multiple, this._isMobileType);
            break;
    }
}

    constructor(inj: Injector, @Attribute('select.event') public onSelectEvt) {
        super(inj, WIDGET_CONFIG);
        // styler(this.nativeElement, this);
    }

    ngOnInit() {
        super.ngOnInit();
        // Todo:[Shubham] this._isMobileType = !CONSTANTS.$rootScope.isApplicationType;
        this._isMobileType = false;
        this._isCordova = false;
    }
}