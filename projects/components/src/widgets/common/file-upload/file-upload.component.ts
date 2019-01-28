import { AfterViewInit, Attribute, Component, Injector, OnInit } from '@angular/core';

import { Subject } from 'rxjs';

import { App, DataSource, isAudioFile, isImageFile, isVideoFile } from '@wm/core';

import { registerProps } from './file-upload.props';
import { StylableComponent } from '../base/stylable.component';
import { styler } from '../../framework/styler';
import { provideAsWidgetRef } from '../../../utils/widget-utils';

declare const _, $;

const DEFAULT_CLS = 'app-fileupload';
const WIDGET_CONFIG = {
    widgetType: 'wm-fileupload',
    hostClass: DEFAULT_CLS
};

@Component({
    selector: '[wmFileUpload]',
    templateUrl: './file-upload.component.html',
    providers: [
        provideAsWidgetRef(FileUploadComponent)
    ]
})

export class FileUploadComponent extends StylableComponent implements OnInit, AfterViewInit {
    static initializeProps = registerProps();
    selectedFiles: any = [];
    progressObservable;
    name;
    multiple;
    fileTransfers = {};
    caption = 'Upload';
    formName = '';
    maxfilesize;
    selectedUploadTypePath;
    DEFAULT_CAPTIONS = {
        MULTIPLE_SELECT: 'Drop your files here.',
        SELECT: 'Select'
    };
    DEVICE_CONTENTTYPES = {
        IMAGE: 'image',
        VIDEO: 'video',
        AUDIO: 'audio',
        FILES: 'files'
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
        fileName: '',
        path: '',
        length: '',
        status: ''
    };
    /*_hasOnSuccessEvt = WM.isDefined(attrs.onSuccess);
     _hasOnErrorEvt = WM.isDefined(attrs.onError);*/

    // Checking if the selected file is valid for the choosen filter type
    isValidFile(filename, contenttype, extensionName, isMobileType) {
        let isValid, contentTypes;

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
        const validFiles = [];
        const MAXFILEUPLOAD_SIZE = parseFloat(this.maxfilesize) * this.FILESIZE_MB || this.FILESIZE_MB;
        const MAX_FILE_UPLOAD_FORMATTED_SIZE = (this.maxfilesize || '1') + 'MB';

        // if contenttype is files for mobile projects.
        if (this.chooseFilter === this.DEVICE_CONTENTTYPES.FILES) {
            this.chooseFilter = '';
        }

        _.forEach($files, (file) => {
            /* check for the file content type before uploading */
            if (!this.isValidFile(file.name, this.chooseFilter, this.getFileExtension(file.name), this._isMobileType)) {
                this.app.notifyApp('Expected a ' + this.chooseFilter + ' file', 'Error');
                return;
            }
            if (file.size > MAXFILEUPLOAD_SIZE) {
                this.app.notifyApp('File size exceeded limit. Max upload size is ' + MAX_FILE_UPLOAD_FORMATTED_SIZE, 'Error');
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
    changeServerUploadPath(path) {
        this.selectedUploadTypePath = path;
    }

    /* this function returns the fileextension */
    getFileExtension(fileName) {
        if (fileName && _.includes(fileName, '.')) {
            return fileName.substring(fileName.lastIndexOf('.') + 1);
        }
        return 'file';
    }

    /**
     * Calls select Event
     * @param $event
     * @param $files
     */
    onSelectEventCall($event, $files) {
        this.selectedFiles = $files;
        setTimeout(() => {
            this.invokeEventCallback('select', {
                $event: $.extend($event.$files || {}, $files),
                selectedFiles: $files
            });
        });
    }

    onFileElemClick() {
        const fileInputElem = $('.file-input')[0];
        fileInputElem.value = null;
    }

    /*this function to append upload status dom elements to widget */
    onFileSelect($event, $files) {
        let beforeSelectVal;
        $files = this.getValidFiles($files);
        // Make call if there are valid files else no call is made
        if ($files.length) {
            this.progressObservable = new Subject();
            // EVENT: ON_BEFORE_SELECT
            beforeSelectVal = this.invokeEventCallback('beforeselect', {
                $event: $.extend($event.$files || {}, $files),
                files: $files
            });
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
            } else {
                this.selectedFiles = $files;
            }
            if (beforeSelectVal !== false) {
                // EVENT: ON_SELECT
                this.onSelectEventCall($event, $files);
            }
        }
    }

    /**
     * Aborts a file upload request
     * @param $file, the file for which the request is to be aborted
     */
    abortFileUpload($file) {
        $file.status = 'abort';
        this.datasource.execute(DataSource.Operation.CANCEL, $file);
    }

    /* Define the property change handler. This function will be triggered when there is a change in the widget property */
    onPropertyChange(key, nv, ov) {
        /*Monitoring changes for styles or properties and accordingly handling respective changes.*/
        switch (key) {
            case 'uploadpath':
                // TODO Srinivas: why do we need uploadpath
                this.changeServerUploadPath(nv);
                break;
            case 'contenttype':
                this.chooseFilter = nv.split(' ').join(',');
                break;
            case 'multiple':
                this.formName = this.name + (this.multiple ? '-multiple-fileupload' : '-single-fileupload');
                this.caption = this.getCaption(this.caption, this.multiple, this._isMobileType);
                break;
            case 'fileuploadmessage':
                this.fileUploadMessage = nv;
        }

        super.onPropertyChange(key, nv, ov);
    }

    constructor(inj: Injector, private app: App, @Attribute('select.event') public onSelectEvt) {
        super(inj, WIDGET_CONFIG);
        // styler(this.nativeElement, this);
    }

    ngOnInit() {
        super.ngOnInit();
    }

    ngAfterViewInit() {
        styler( this.nativeElement.querySelector('.app-button, .drop-box'), this);
    }
}
