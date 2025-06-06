import { CommonModule } from '@angular/common';
import { WmComponentsModule } from "@wm/components/base";
import {AfterViewInit, Attribute, Component, Inject, Injector, OnDestroy, OnInit, Optional} from '@angular/core';

import { Subject, Subscription } from 'rxjs';

import { App, DataSource, getWmProjectProperties, isAudioFile, isImageFile, isVideoFile, AbstractDialogService, IDGenerator } from '@wm/core';
import {provideAsWidgetRef, StylableComponent, styler} from '@wm/components/base';

import {registerProps} from './file-upload.props';
import {forEach, includes, isEmpty, toLower} from "lodash-es";

declare const $;

const DEFAULT_CLS = 'app-fileupload';
const WIDGET_CONFIG = {
    widgetType: 'wm-fileupload',
    hostClass: DEFAULT_CLS
};

@Component({
  standalone: true,
  imports: [CommonModule, WmComponentsModule],
    selector: '[wmFileUpload]',
    templateUrl: './file-upload.component.html',
    providers: [
        provideAsWidgetRef(FileUploadComponent)
    ]
})

export class FileUploadComponent extends StylableComponent implements OnInit, AfterViewInit, OnDestroy {
    static initializeProps = registerProps();
    selectedFiles: any = [];
    uploadedFiles: any = [];
    selectedFolders: any = [];
    progressObservable: Subject<any>;
    deleteFileObservable: Subject<any>;
    name;
    hint;
    arialabel;
    multiple;
    fileTransfers = {};
    caption = 'Upload';
    formName = '';
    maxfilesize;
    cleariconclass;
    cleariconhint;
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
    // parentPrefabScope = element.closest('.app-prefab').isolateScope(),
    CONSTANT_FILE_SERVICE = 'FileService';
    uploadData = {
        file: undefined,
        uploadPath: undefined
    };
    allowedFileUploadExtensions = getWmProjectProperties().allowedFileUploadExtensions;
    defaultAllowedExtensions = this.allowedFileUploadExtensions.split(',').map(item => item.trim()).map(item => item.endsWith('/*') ? item : `.${item}`);
    chooseFilter = this.defaultAllowedExtensions.includes('*/*') ? '' : this.defaultAllowedExtensions;
    datasource;
    deletedatasource;
    fileUploadMessage = 'Drop your files here or click here to browse';
    highlightDropArea;
    showprogressbar;
    showprogressbarpercentage;
    deleteiconhint;
    private uploadProgressSubscription: Subscription;
    private deleteProgressSubscription: Subscription;
    private idGenerator = new IDGenerator('file-');
    /*_hasOnSuccessEvt = WM.isDefined(attrs.onSuccess);
     _hasOnErrorEvt = WM.isDefined(attrs.onError);*/

    // Checking if the selected file is valid for the choosen filter type
    isValidFile(filename, contenttype, extensionName, isMobileType) {
        let isValid, contentTypes;

        if (!contenttype) {
            return true;
        }
        contentTypes = toLower(contenttype).split(',');

        if (includes(contentTypes, 'image/*') || (includes(contentTypes, 'image') && isMobileType)) {
            isValid = isImageFile(filename);
            // If one of the content type chosen is image and user uploads image it is valid file
            if (isValid) {
                return isValid;
            }
        }
        if (includes(contentTypes, 'audio/*') || (includes(contentTypes, 'audio') && isMobileType)) {
            isValid = isAudioFile(filename);
            // If one of the content type chosen is audio/* and user uploads audio it is valid file
            if (isValid) {
                return isValid;
            }
        }
        if (includes(contentTypes, 'video/*') || (includes(contentTypes, 'video') && isMobileType)) {
            isValid = isVideoFile(filename);
            // If one of the content type chosen is video/* and user uploads video it is valid file
            if (isValid) {
                return isValid;
            }
        }
        /*content type and the uploaded file extension should be same*/
        if (includes(contentTypes, '.' + toLower(extensionName))) {
            isValid = true;
        }
        return isValid;
    }

    /* this return the array of files which are having the file size not more than maxfilesize and filters based on contenttype */
    getValidFiles($files) {
        const validFiles = [];
        const errorFiles = [];
        const MAXFILEUPLOAD_SIZE = parseFloat(this.maxfilesize) * this.FILESIZE_MB || this.FILESIZE_MB;
        const MAX_FILE_UPLOAD_FORMATTED_SIZE = (this.maxfilesize || '1') + 'MB';

        // if contenttype is files for mobile projects.
        if (this.chooseFilter === this.DEVICE_CONTENTTYPES.FILES) {
            this.chooseFilter = '';
        }

        forEach($files, (file) => {
            /* check for the file content type before uploading */
            if (!this.isValidFile(file.name, this.chooseFilter, this.getFileExtension(file.name), this._isMobileType)) {
                const msg = `${this.appLocale.LABEL_FILE_EXTENTION_VALIDATION_MESSAGE} ${this.chooseFilter}`;
                this.handleErrorFiles('INVALID_FILE_EXTENSION', msg, file, errorFiles);
                return;
            }
            if (file.size > MAXFILEUPLOAD_SIZE) {
                const msg = `${this.appLocale.LABEL_FILE_EXCEED_VALIDATION_MESSAGE} ${MAX_FILE_UPLOAD_FORMATTED_SIZE}`;
                this.handleErrorFiles('INVALID_FILE_SIZE', msg, file, errorFiles);
                return;
            }
            validFiles.push(file);
        });
        return {
            validFiles: validFiles,
            errorFiles: errorFiles
        };
    }

    handleErrorFiles(key, msg, file, errorFiles) {
        // Check whether the error callback exist or not. If it exists then dont show taoster message
        if (!this.hasEventCallback('error')) {
            this.app.notifyApp(msg, 'Error');
        }
        const error = {
            key: key,
            message: msg
        };
        file.error = error;
        errorFiles.push(file);
    }

    /*Overwrite the caption only if they are default*/
    getCaption(caption, isMultiple, isMobileType) {
        if (includes(this.DEFAULT_CAPTIONS, caption)) {
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
        if (fileName && includes(fileName, '.')) {
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
        $files.forEach(file => {
            file.uniqueId = this.idGenerator.nextUid();
        })
        this.selectedFiles = $files;
        this.uploadedFiles = this.multiple ? [...this.uploadedFiles, ...$files] : $files;
        setTimeout(() => {
            this.invokeEventCallback('select', {
                $event: $.extend($event.$files || {}, $files),
                selectedFiles: $files
            });
        });
    }

    onFileElemClick($event) {
        this.highlightDropArea = true;

        //The file upload widget value should be set to null to reupload the same file.
        this.$element.find('.file-input')[0].value = null;
        $event.stopPropagation();

        // when the filepicker is not there on the window, remove the dropzone highlight
        window.addEventListener('focus', this.disableDropZone.bind(this));
    }

    disableDropZone() {
        this.highlightDropArea = false;
        window.removeEventListener('focus', this.disableDropZone);
    }

    /*this function to clear the specified file. if argument is not provided, it clears the complete list  */
    clear(fileObj) {
        this.selectedFiles = (fileObj) ? this.clearFile(this.selectedFiles, fileObj) : [];
        this.uploadedFiles = (fileObj) ? this.clearFile(this.uploadedFiles, fileObj) : [];
    }

    private clearFile(files, fileObj) {
        return files.filter((file) => file?._response?.fileName !== fileObj?._response?.fileName || file?.name !== fileObj?.name || file !== fileObj);
    }

    /*this function to set the class names for clear icon */
    setClearIconClass(classValue) {
        this.cleariconclass = classValue;
    }
    /*this function to set the hint for clear icon */
    setClearIconHint(hint) {
        this.cleariconhint = hint;
    }


    /*this function to append upload status dom elements to widget */
    onFileSelect($event, $files) {
        let beforeSelectVal;
        const files = this.getValidFiles($files);
        $files = files.validFiles;

        // If the user has previously tried uploading folders using drop, and then uploading using click method we clear the folders dom
        if ($event.type === "change") {
            this.selectedFolders = [];
        }

        // Trigger error callback event if any invalid file found.
        if (!isEmpty(files.errorFiles)) {
            this.invokeEventCallback('error', {
                $event,
                files: files.errorFiles
            });
        }

        // Make call if there are valid files else no call is made
        if ($files.length) {
            // EVENT: ON_BEFORE_SELECT
            beforeSelectVal = this.invokeEventCallback('beforeselect', {
                $event: $.extend($event.$files || {}, $files),
                files: $files
            });
            if (this.datasource) {
                if(!this.uploadProgressSubscription) {
                    this.progressObservable = new Subject();
                    this.datasource._progressObservable = this.progressObservable;
                    this.uploadProgressSubscription = this.datasource._progressObservable.asObservable().subscribe((progressObj) => {
                        forEach(this.uploadedFiles, (file) => {
                            if (file.name === progressObj.fileName && file.uniqueId === progressObj.uniqueId) {
                                file.progress = progressObj.progress;
                                if (file.progress === 100) {
                                    file.status = 'success';
                                } else {
                                    file.status = progressObj.status;
                                    if (progressObj.errMsg) {
                                        file.errMsg = progressObj.errMsg;
                                        this.invokeEventCallback('error', {
                                            $event,
                                            files: file
                                        });
                                    }
                                }
                            }
                        });
                    });
                }
            } else {
                this.selectedFiles = $files;
            }
            if (beforeSelectVal !== false) {
                // EVENT: ON_SELECT
                this.onSelectEventCall($event, $files);
            }
        }
    }

    onFileDelete($event, file) {
        if(!file) {
            return;
        }

        const beforeDeleteVal = this.invokeEventCallback('beforedelete', { $event: file });

        if (beforeDeleteVal !== false) {
            this.dialogService.showAppConfirmDialog({
                title: "Delete file",
                message: "Are you sure you want to delete this file?",
                oktext: "Ok",
                canceltext: "Cancel",
                onOk: () => {
                    if (this.deletedatasource) {
                        this.deletedatasource.setInput('file', file._response.fileName || file.name);

                        if(!this.deleteProgressSubscription) {
                            this.deleteFileObservable = new Subject();
                            this.deletedatasource._deleteFileObservable = this.deleteFileObservable;
                            this.deletedatasource._deleteFileObservable.asObservable().subscribe((response) => {
                                if(response.status === "success") {
                                    this.selectedFiles = this.selectedFiles.filter((fileObj) => file !== fileObj) || [];
                                    this.uploadedFiles = this.uploadedFiles.filter((fileObj) => file !== fileObj) || [];
                                }
                            });
                        }
                    }
                    this.invokeEventCallback('delete', { $event: file });
                    this.dialogService.closeAppConfirmDialog();
                },
                onCancel: () => {
                    this.dialogService.closeAppConfirmDialog();
                },
                onOpen: () => {
                    $('.cancel-action').focus();
                }
            });
        }
    }

    // Prevent default behavior (Prevent file from being opened)
    dragOverHandler($event) {
        $event.preventDefault();
        $event.stopPropagation();
    }

    // Get the file data if it exists and call the onFileSelect function
    onFileDrop($event) {
        $event.preventDefault();
        let listOfFiles = [];
        this.selectedFolders = [];
        const filesData = $event.dataTransfer.items;
        if (filesData.length > 0) {
            // Use DataTransferItemList interface to access the file(s)
            for (var i = 0; i < filesData.length; i++) {
                 // Get all the files and push them into an array
                if (filesData[i].webkitGetAsEntry().isFile) {
                    listOfFiles.push(filesData[i].getAsFile());
                }
                // If a selected item is directory push the folder element into an array and display error message by adding to dom
                else if(filesData[i].webkitGetAsEntry().isDirectory) {
                    this.selectedFolders.push(filesData[i].getAsFile());
                }
            }
            this.onFileSelect($event, listOfFiles);
        }
    }

    dragOverCb(e) {
        e.preventDefault();
        $(this.nativeElement).find('#dropzone').addClass('highlight-drop-box');
    }

    dropCb() {
        $(this.nativeElement).find('#dropzone').removeClass('highlight-drop-box');
    }

    // this function triggers file select window, when clicked anywhere on the file upload widget in case of multi select
    triggerFileSelect() {
        this.$element.find('.file-input').trigger('click');
    }

    /**
     * Aborts a file upload request
     * @param $file, the file for which the request is to be aborted
     */
    abortFileUpload($file) {
        this.datasource.execute(DataSource.Operation.CANCEL, $file);
    }

    isMimeType(file: string) {
        return (this.defaultAllowedExtensions.includes('image/*') && isImageFile(file))
            || (this.defaultAllowedExtensions.includes('audio/*') && isAudioFile(file))
            || (this.defaultAllowedExtensions.includes('video/*') && isVideoFile(file));
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
                if (this.defaultAllowedExtensions.includes('*/*')) {
                    this.chooseFilter = nv.split(' ').join(',')
                } else {
                    this.chooseFilter = nv.split(' ').filter(item => this.defaultAllowedExtensions.includes(item) || this.isMimeType(item)).join(',');
                    if (isEmpty(this.chooseFilter)) {
                        this.chooseFilter = this.defaultAllowedExtensions;
                    }
                }

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

    constructor(inj: Injector, private app: App, @Attribute('select.event') public onSelectEvt, private dialogService: AbstractDialogService, @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any) {
        super(inj, WIDGET_CONFIG, explicitContext);
        // styler(this.nativeElement, this);
    }

    ngOnInit() {
        super.ngOnInit();
        // adding, dragover and drop on the document as when file is dragged on to the page highlight the dropzones and remove highlight on file drop
        document.addEventListener('dragover', this.dragOverCb.bind(this));
        document.addEventListener('drop', this.dropCb.bind(this));

        // adding mouseleave evnt to remove highlight when file is dropped outside the window
        document.addEventListener('mouseleave', this.dropCb.bind(this));
    }

    ngAfterViewInit() {
        styler( this.nativeElement.querySelector('.app-button, .drop-box'), this);
    }

    ngOnDestroy() {
        document.removeEventListener('dragover', this.dragOverCb);
        document.removeEventListener('drop', this.dropCb);
        document.removeEventListener('mouseleave', this.dropCb);
        super.ngOnDestroy();

        const subscriptions = [this.uploadProgressSubscription, this.deleteProgressSubscription];
        subscriptions.forEach(subscription => {
            if (subscription) {
                subscription.unsubscribe();
            }
        });
    }
}
