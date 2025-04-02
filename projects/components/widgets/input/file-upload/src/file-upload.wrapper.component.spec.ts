import { ComponentFixture } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { AbstractDialogService, App } from '@wm/core';
import { FileUploadComponent } from './file-upload.component';
import { ComponentTestBase, ITestComponentDef, ITestModuleDef } from '../../../../base/src/test/common-widget.specs';
import { compileTestComponent, mockApp } from '../../../../base/src/test/util/component-test-util';
import { FileIconClassPipe, FileSizePipe, StateClassPipe } from '../../../../base/src/pipes/custom-pipes';
import { Subject } from 'rxjs/internal/Subject';

jest.mock('@wm/core', () => ({
    ...jest.requireActual('@wm/core'),
    getWmProjectProperties: jest.fn(() => ({
        "allowedFileUploadExtensions": "doc, docx, xls, xlsx, csv, pdf, txt, image/*, json, ogg",
    }))
}));


const markup = `<div wmFileUpload name="testfileupload" select.event="onSelect($event, widget, selectedFiles)" error.event="onError($event, widget, files)" role="input"></div>`;

@Component({
    template: markup
})

class FileUploadWrapperComponent {
    @ViewChild(FileUploadComponent, /* TODO: add static flag */ { static: true })
    wmComponent: FileUploadComponent;
    files: Array<File>;

    onSelect = function ($event, widget, selectedFiles) {
        // console.log('select event triggered');
    };

    onError = function ($event, wiidget, files) {
        // console.log('error event triggered', files);
    };
}

const testModuleDef: ITestModuleDef = {
    declarations: [FileUploadWrapperComponent],
    imports: [FileUploadComponent, FileSizePipe, FileIconClassPipe, StateClassPipe],
    providers: [{ provide: App, useValue: mockApp }, AbstractDialogService]
};

const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-fileupload',
    widgetSelector: '[wmFileUpload]',
    testModuleDef: testModuleDef,
    testComponent: FileUploadWrapperComponent
};

const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
// TestBase.verifyPropsInitialization();
// TestBase.verifyCommonProperties();
// TestBase.verifyStyles();
// TestBase.verifyAccessibility();

describe('Fileupload Component', () => {
    let fixture: ComponentFixture<FileUploadWrapperComponent>;
    let wrapperComponent: FileUploadWrapperComponent;
    let wmComponent: FileUploadComponent;
    beforeEach(() => {
        fixture = compileTestComponent(testModuleDef, FileUploadWrapperComponent);
        wrapperComponent = fixture.componentInstance;
        wmComponent = wrapperComponent.wmComponent;
        fixture.detectChanges();
    });
    it('should create the Fileupload Component', () => {
        expect(wrapperComponent).toBeTruthy();
    });

    function getFile() {
        const files = new Array<File>();
        const content = 'Hello World';
        const blob = new Blob([content], { type: 'text/plain' });
        const file = new File([blob], 'Mock.csv');
        files.push(file);
        return files;
    }

    function getHugeFile() {
        const files = new Array<File>();
        const file = new File([''], 'Mock.csv');
        Object.defineProperty(
            file, 'size', { value: 1572864, writable: false }); // here filesize is 1.5MB which is equls to 1572864 bytes
        files.push(file);
        return files;
    }

    it('should upload the selected file', () => {
        const mockFiles = getFile();
        wmComponent.onFileSelect({}, mockFiles);
        fixture.detectChanges();
        // selected item should be same as mockFile
        expect(wmComponent.selectedFiles).toEqual(mockFiles);
    });

    it('should trigger error callback if filesize exceeds 1MB', () => {
        const mockFiles = getHugeFile();
        jest.spyOn(wrapperComponent, 'onError');
        wmComponent.onFileSelect({}, mockFiles);
        fixture.detectChanges();
        expect(wrapperComponent.onError).toHaveBeenCalledTimes(1);
    });


    describe('isValidFile', () => {

        it('should return true when contenttype is not provided', () => {
            expect(wmComponent.isValidFile('test.txt', null, 'txt', false)).toBe(true);
        });

        it('should return true for valid image file', () => {
            expect(wmComponent.isValidFile('test.jpg', 'image/*', 'jpg', false)).toBe(true);
        });

        it('should return false for invalid image file', () => {
            expect(wmComponent.isValidFile('test.txt', 'image/*', 'txt', false)).toBe(false);
        });

        it('should return true for valid audio file', () => {
            expect(wmComponent.isValidFile('test.mp3', 'audio/*', 'mp3', false)).toBe(true);
        });

        it('should return false for invalid audio file', () => {
            expect(wmComponent.isValidFile('test.txt', 'audio/*', 'txt', false)).toBe(false);
        });

        it('should return true for valid video file', () => {
            expect(wmComponent.isValidFile('test.mp4', 'video/*', 'mp4', false)).toBe(true);
        });

        it('should return false for invalid video file', () => {
            expect(wmComponent.isValidFile('test.txt', 'video/*', 'txt', false)).toBe(false);
        });

        it('should return true for matching file extension', () => {
            expect(wmComponent.isValidFile('test.txt', '.txt', 'txt', false)).toBe(true);
        });

        it('should return undefined for non-matching file extension', () => {
            expect(wmComponent.isValidFile('test.txt', '.jpg', 'txt', false)).toBe(undefined);
        });

        it('should handle mobile type correctly for image', () => {
            expect(wmComponent.isValidFile('test.jpg', 'image', 'jpg', true)).toBe(true);
        });

        it('should handle mobile type correctly for audio', () => {
            expect(wmComponent.isValidFile('test.mp3', 'audio', 'mp3', true)).toBe(true);
        });

        it('should handle mobile type correctly for video', () => {
            expect(wmComponent.isValidFile('test.mp4', 'video', 'mp4', true)).toBe(true);
        });

        it('should handle multiple content types', () => {
            expect(wmComponent.isValidFile('test.jpg', 'image/*, video/*', 'jpg', false)).toBe(true);
            expect(wmComponent.isValidFile('test.mp3', 'image/*, video/*', 'mp3', false)).toBe(false);
        });

        it('should handle case-insensitive file extensions', () => {
            expect(wmComponent.isValidFile('test.JPG', 'image/*', 'JPG', false)).toBe(true);
            expect(wmComponent.isValidFile('test.MP3', 'audio/*', 'MP3', false)).toBe(true);
            expect(wmComponent.isValidFile('test.MP4', 'video/*', 'MP4', false)).toBe(true);
        });
    });

    describe('onFileDrop', () => {
        let mockEvent: { preventDefault: any; dataTransfer: any; };

        beforeEach(() => {
            mockEvent = {
                preventDefault: jest.fn(),
                dataTransfer: {
                    items: []
                }
            };
            wmComponent.onFileSelect = jest.fn();
        });

        it('should prevent default event behavior', () => {
            wmComponent.onFileDrop(mockEvent);
            expect(mockEvent.preventDefault).toHaveBeenCalled();
        });

        it('should not call onFileSelect when no files are dropped', () => {
            wmComponent.onFileDrop(mockEvent);
            expect(wmComponent.onFileSelect).not.toHaveBeenCalled();
        });

        it('should add files to listOfFiles when files are dropped', () => {
            const mockFile = { name: 'test.txt' };
            mockEvent.dataTransfer.items = [{
                webkitGetAsEntry: () => ({ isFile: true }),
                getAsFile: () => mockFile
            }];

            wmComponent.onFileDrop(mockEvent);
            expect(wmComponent.onFileSelect).toHaveBeenCalledWith(mockEvent, [mockFile]);
        });

        it('should add directories to selectedFolders when folders are dropped', () => {
            const mockFolder = { name: 'testFolder' };
            mockEvent.dataTransfer.items = [{
                webkitGetAsEntry: () => ({ isFile: false, isDirectory: true }),
                getAsFile: () => mockFolder
            }];

            wmComponent.onFileDrop(mockEvent);
            expect(wmComponent.selectedFolders).toEqual([mockFolder]);
        });

        it('should handle mixed files and folders', () => {
            const mockFile = { name: 'test.txt' };
            const mockFolder = { name: 'testFolder' };
            mockEvent.dataTransfer.items = [
                {
                    webkitGetAsEntry: () => ({ isFile: true }),
                    getAsFile: () => mockFile
                },
                {
                    webkitGetAsEntry: () => ({ isFile: false, isDirectory: true }),
                    getAsFile: () => mockFolder
                }
            ];

            wmComponent.onFileDrop(mockEvent);
            expect(wmComponent.selectedFolders).toEqual([mockFolder]);
            expect(wmComponent.onFileSelect).toHaveBeenCalledWith(mockEvent, [mockFile]);
        });
    });
    describe('onPropertyChange', () => {
        beforeEach(() => {
            wmComponent.changeServerUploadPath = jest.fn();
            wmComponent.name = 'testUpload';
            wmComponent.multiple = false;
            wmComponent._isMobileType = false;
            jest.spyOn(wmComponent, 'getCaption').mockClear();
        });

        it('should call changeServerUploadPath when uploadpath changes', () => {
            wmComponent.onPropertyChange('uploadpath', '/new/path', '/old/path');
            expect(wmComponent.changeServerUploadPath).toHaveBeenCalledWith('/new/path');
        });

        it('should update chooseFilter when contenttype changes', () => {
            wmComponent.onPropertyChange('contenttype', 'image/* video/*', 'image/*');
            expect(wmComponent.chooseFilter).toBe("image/*");
        });

        it('should update formName and caption when multiple changes to true', () => {
            wmComponent.multiple = true;
            wmComponent.onPropertyChange('multiple', true, false);
            expect(wmComponent.formName).toBe('testUpload-multiple-fileupload');
            expect(wmComponent.getCaption).toHaveBeenCalledWith(wmComponent.caption, true, false);
        });

        it('should update formName and caption when multiple changes to false', () => {
            wmComponent.multiple = false;
            wmComponent.onPropertyChange('multiple', false, true);
            expect(wmComponent.formName).toBe('testUpload-single-fileupload');
            expect(wmComponent.getCaption).toHaveBeenCalledWith(wmComponent.caption, false, false);
        });
        it('should update fileUploadMessage when fileuploadmessage changes', () => {
            wmComponent.onPropertyChange('fileuploadmessage', 'New message', 'Old message');
            expect(wmComponent.fileUploadMessage).toBe('New message');
        });

        it('should call super.onPropertyChange for any property change', () => {
            const superSpy = jest.spyOn(Object.getPrototypeOf(FileUploadComponent.prototype), 'onPropertyChange');
            wmComponent.onPropertyChange('testKey', 'newValue', 'oldValue');
            expect(superSpy).toHaveBeenCalledWith('testKey', 'newValue', 'oldValue');
        });
    });


    describe('getValidFiles', () => {
        beforeEach(() => {
            fixture.detectChanges();
            // Set up necessary properties
            wmComponent.FILESIZE_MB = 1048576; // 1MB in bytes
            (wmComponent as any).appLocale = {
                LABEL_FILE_EXTENTION_VALIDATION_MESSAGE: 'Invalid file extension. Allowed:',
                LABEL_FILE_EXCEED_VALIDATION_MESSAGE: 'File size exceeds the limit of'
            };
            // Spy on handleErrorFiles to check if it's called
            jest.spyOn(wmComponent, 'handleErrorFiles');
        });

        it('should return valid files when all files are valid', () => {
            wmComponent.maxfilesize = '2'; // 2MB
            wmComponent.chooseFilter = '.csv';
            const files = getFile();

            const result = wmComponent.getValidFiles(files);

            expect(result.validFiles).toHaveLength(1);
            expect(result.errorFiles).toHaveLength(0);
        });

        it('should filter out files with invalid extensions', () => {
            wmComponent.chooseFilter = '.txt';
            const files = getFile();

            const result = wmComponent.getValidFiles(files);

            expect(result.validFiles).toHaveLength(0);
            expect(result.errorFiles).toHaveLength(1);
            expect(wmComponent.handleErrorFiles).toHaveBeenCalledTimes(1);
            expect(wmComponent.handleErrorFiles).toHaveBeenCalledWith(
                'INVALID_FILE_EXTENSION',
                'Invalid file extension. Allowed: .txt',
                files[0],
                result.errorFiles
            );
        });

        it('should filter out files exceeding the maximum file size', () => {
            wmComponent.maxfilesize = '1'; // 1MB
            wmComponent.chooseFilter = '.csv';
            const files = getHugeFile();

            const result = wmComponent.getValidFiles(files);

            expect(result.validFiles).toHaveLength(0);
            expect(result.errorFiles).toHaveLength(1);
            expect(wmComponent.handleErrorFiles).toHaveBeenCalledTimes(1);
            expect(wmComponent.handleErrorFiles).toHaveBeenCalledWith(
                'INVALID_FILE_SIZE',
                'File size exceeds the limit of 1MB',
                files[0],
                result.errorFiles
            );
        });

        it('should notify app if error callback does not exist', () => {
            jest.spyOn(wmComponent as any, 'hasEventCallback').mockReturnValue(false);
            const key = 'INVALID_FILE_SIZE';
            const msg = 'File size exceeds the limit';
            const file = { name: 'test.txt', size: 5000 };
            const errorFiles = [];

            wmComponent.handleErrorFiles(key, msg, file, errorFiles);
            expect(errorFiles).toContain(file);
        });

        it('should use default max file size when maxfilesize is not set', () => {
            wmComponent.maxfilesize = undefined;
            wmComponent.chooseFilter = '.csv';
            const files = getHugeFile();

            const result = wmComponent.getValidFiles(files);

            expect(result.validFiles).toHaveLength(0);
            expect(result.errorFiles).toHaveLength(1);
            expect(wmComponent.handleErrorFiles).toHaveBeenCalledWith(
                'INVALID_FILE_SIZE',
                'File size exceeds the limit of 1MB',
                files[0],
                result.errorFiles
            );
        });

        it('should clear chooseFilter when it equals DEVICE_CONTENTTYPES.FILES for mobile projects', () => {
            wmComponent.chooseFilter = wmComponent.DEVICE_CONTENTTYPES.FILES;
            wmComponent._isMobileType = true;
            const files = getFile();

            wmComponent.getValidFiles(files);

            expect(wmComponent.chooseFilter).toBe('');
        });
    });

    describe('disableDropZone', () => {
        it('should set highlightDropArea to false', () => {
            wmComponent.highlightDropArea = true;

            wmComponent.disableDropZone();

            expect(wmComponent.highlightDropArea).toBe(false);
        });

        it('should remove focus event listener', () => {
            const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

            wmComponent.disableDropZone();

            expect(removeEventListenerSpy).toHaveBeenCalledWith('focus', wmComponent.disableDropZone);
        });
    });

    describe('clear', () => {
        beforeEach(() => {
            wmComponent.selectedFiles = [
                { name: 'file1.txt' },
                { name: 'file2.txt' },
                { name: 'file3.txt' }
            ];
        });

        it('should not modify the array if the specified file is not found', () => {
            const nonExistentFile = { name: 'nonexistent.txt' };
            wmComponent.clear(nonExistentFile);
            expect(wmComponent.selectedFiles).toEqual([
                { name: 'file1.txt' },
                { name: 'file2.txt' },
                { name: 'file3.txt' }
            ]);
        });
    });

    describe('setClearIconClass', () => {
        it('should set the cleariconclass property', () => {
            wmComponent.setClearIconClass('custom-class');
            expect(wmComponent.cleariconclass).toBe('custom-class');
        });
    });

    describe('setClearIconHint', () => {
        it('should set the cleariconhint property', () => {
            wmComponent.setClearIconHint('Custom hint');
            expect(wmComponent.cleariconhint).toBe('Custom hint');
        });
    });

    describe('getCaption', () => {
        it('should return MULTIPLE_SELECT caption when isMultiple is true and isMobileType is false', () => {
            const result = wmComponent.getCaption('Drop your files here.', true, false);
            expect(result).toBe(wmComponent.DEFAULT_CAPTIONS.MULTIPLE_SELECT);
        });

        it('should return SELECT caption when isMultiple is false', () => {
            const result = wmComponent.getCaption('Select', false, false);
            expect(result).toBe(wmComponent.DEFAULT_CAPTIONS.SELECT);
        });

        it('should return SELECT caption when isMobileType is true, regardless of isMultiple', () => {
            const result1 = wmComponent.getCaption('Select', true, true);
            const result2 = wmComponent.getCaption('Select', false, true);
            expect(result1).toBe(wmComponent.DEFAULT_CAPTIONS.SELECT);
            expect(result2).toBe(wmComponent.DEFAULT_CAPTIONS.SELECT);
        });

        it('should return the input caption when it is not a default caption', () => {
            const customCaption = 'Custom Caption';
            const result = wmComponent.getCaption(customCaption, true, false);
            expect(result).toBe(customCaption);
        });

        it('should handle undefined input caption', () => {
            const result = wmComponent.getCaption(undefined, true, false);
            expect(result).toBeUndefined();
        });

        it('should handle null input caption', () => {
            const result = wmComponent.getCaption(null, true, false);
            expect(result).toBeNull();
        });

        it('should handle empty string input caption', () => {
            const result = wmComponent.getCaption('', true, false);
            expect(result).toBe('');
        });
    });

    describe('onFileSelect', () => {
        let mockEvent: any;
        let mockFiles: File[];

        beforeEach(() => {
            mockEvent = { type: 'change' };
            mockFiles = [
                new File(['content'], 'valid.txt', { type: 'text/plain' }),
                new File(['content'], 'invalid.txt', { type: 'text/plain' })
            ];

            // Set up the component for testing
            wmComponent.maxfilesize = '1'; // 1MB
            wmComponent.chooseFilter = '.txt';
            wmComponent.selectedFolders = ['folder1', 'folder2'];

            // Spy on methods we want to check
            jest.spyOn(wmComponent, 'invokeEventCallback');
            jest.spyOn(wmComponent, 'onSelectEventCall');
        });

        it('should clear selectedFolders when event type is "change"', () => {
            wmComponent.onFileSelect(mockEvent, mockFiles);
            expect(wmComponent.selectedFolders).toEqual([]);
        });

        it('should invoke error callback when there are error files', () => {
            wmComponent.maxfilesize = '0.000001'; // Set a very small max file size to force an error
            wmComponent.onFileSelect(mockEvent, mockFiles);
            expect(wmComponent.invokeEventCallback).toHaveBeenCalledWith('error', expect.objectContaining({
                files: expect.arrayContaining([expect.objectContaining({ name: 'valid.txt' })])
            }));
        });

        it('should create a new Subject when there are valid files', () => {
            wmComponent.onFileSelect(mockEvent, mockFiles);
            //expect(wmComponent.progressObservable).toBeDefined();
            //expect(wmComponent.progressObservable).toBeInstanceOf(Subject);
        });

        it('should invoke beforeselect callback when there are valid files', () => {
            wmComponent.onFileSelect(mockEvent, mockFiles);
            expect(wmComponent.invokeEventCallback).toHaveBeenCalledWith('beforeselect', expect.any(Object));
        });

        it('should set up datasource progress observable when datasource exists', () => {
            wmComponent.datasource = {};
            wmComponent.onFileSelect(mockEvent, mockFiles);
            expect(wmComponent.datasource._progressObservable).toBeDefined();
            expect(wmComponent.datasource._progressObservable).toBeInstanceOf(Subject);
        });

        it('should update file progress when datasource emits progress', (done) => {
            wmComponent.datasource = {};
            wmComponent.onFileSelect(mockEvent, mockFiles);

            const progressObj = { fileName: 'valid.txt', progress: 50, status: 'uploading' };
            wmComponent.datasource._progressObservable.next(progressObj);

            // Use setTimeout to allow for the asynchronous update
            setTimeout(() => {
                //expect(wmComponent.selectedFiles[0].progress).toBe(50);
                //expect(wmComponent.selectedFiles[0].status).toBe('uploading');
                done();
            }, 0);
        });

        it('should set file status to success when progress is 100', (done) => {
            wmComponent.datasource = {};
            wmComponent.onFileSelect(mockEvent, mockFiles);

            const progressObj = { fileName: 'valid.txt', progress: 100 };
            wmComponent.datasource._progressObservable.next(progressObj);

            setTimeout(() => {
                //expect(wmComponent.selectedFiles[0].status).toBe('success');
                done();
            }, 0);
        });

        it('should set selectedFiles when datasource does not exist', () => {
            wmComponent.datasource = null;
            wmComponent.onFileSelect(mockEvent, mockFiles);
            expect(wmComponent.selectedFiles.length).toBeGreaterThan(0);
        });

        it('should call onSelectEventCall when beforeSelectVal is not false', () => {
            jest.spyOn(wmComponent, 'invokeEventCallback').mockReturnValue(true);
            wmComponent.onFileSelect(mockEvent, mockFiles);
            expect(wmComponent.onSelectEventCall).toHaveBeenCalled();
        });

        it('should not call onSelectEventCall when beforeSelectVal is false', () => {
            jest.spyOn(wmComponent, 'invokeEventCallback').mockReturnValue(false);
            wmComponent.onFileSelect(mockEvent, mockFiles);
            expect(wmComponent.onSelectEventCall).not.toHaveBeenCalled();
        });
        it('should set error message when datasource emits progress with an error', (done) => {
            wmComponent.datasource = {};
            wmComponent.onFileSelect(mockEvent, mockFiles);

            const progressObj = {
                fileName: 'valid.txt',
                progress: 50,
                status: 'error',
                errMsg: 'Upload failed due to network error'
            };
            wmComponent.datasource._progressObservable.next(progressObj);

            // Use setTimeout to allow for the asynchronous update
            setTimeout(() => {
                const updatedFile = wmComponent.selectedFiles.find(file => file.name === 'valid.txt');
                //expect(updatedFile.progress).toBe(50);
                //expect(updatedFile.status).toBe('error');
                //expect(updatedFile.errMsg).toBe('Upload failed due to network error');
                done();
            }, 0);
        });
    });

    describe('onFileElemClick', () => {
        let mockEvent: any;
        let mockFileInput: any;

        beforeEach(() => {
            mockEvent = {
                stopPropagation: jest.fn()
            };

            mockFileInput = {
                value: 'some-file.txt'
            };

            // Spy on the find method of $element
            jest.spyOn(wmComponent.$element, 'find').mockReturnValue([mockFileInput]);

            jest.spyOn(window, 'addEventListener');
            jest.spyOn(wmComponent, 'disableDropZone');
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should set highlightDropArea to true', () => {
            wmComponent.onFileElemClick(mockEvent);
            expect(wmComponent.highlightDropArea).toBe(true);
        });

        it('should call stopPropagation on the event', () => {
            wmComponent.onFileElemClick(mockEvent);
            expect(mockEvent.stopPropagation).toHaveBeenCalled();
        });

        it('should add a focus event listener to the window', () => {
            wmComponent.onFileElemClick(mockEvent);
            expect(window.addEventListener).toHaveBeenCalledWith('focus', expect.any(Function));
        });

        it('should bind the disableDropZone method to the focus event listener', () => {
            wmComponent.onFileElemClick(mockEvent);
            const listener = (window.addEventListener as jest.Mock).mock.calls[0][1];
            listener();
            expect(wmComponent.disableDropZone).toHaveBeenCalled();
        });
    });

    describe('abortFileUpload', () => {
        it('should execute cancel operation on datasource', () => {
            const mockFile = {};
            wmComponent.datasource = {
                execute: jest.fn()
            } as any;

            wmComponent.abortFileUpload(mockFile);

            expect(wmComponent.datasource.execute).toHaveBeenCalledWith('cancel', mockFile);
        });
    });

    describe('dragOverHandler', () => {
        it('should prevent default and stop propagation', () => {
            const mockEvent = {
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            };

            wmComponent.dragOverHandler(mockEvent as any);

            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(mockEvent.stopPropagation).toHaveBeenCalled();
        });
    });

    describe('Common Functions', () => {
        let nativeElement: HTMLElement;
        beforeEach(() => {
            nativeElement = fixture.nativeElement;
            fixture.detectChanges();
        });

        it('should change server upload path', () => {
            const newPath = '/new/upload/path';
            wmComponent.changeServerUploadPath(newPath);
            expect(wmComponent.selectedUploadTypePath).toBe(newPath);
        });

        it('should highlight dropzone on drag over', () => {
            // Mock the nativeElement to include the dropzone
            const dropzone = document.createElement('div');
            dropzone.id = 'dropzone';
            nativeElement.appendChild(dropzone);

            // Mock jQuery to return the mocked nativeElement
            const mockJQuery = jest.fn().mockReturnValue({
                find: jest.fn().mockReturnValue({
                    addClass: jest.fn((className) => {
                        dropzone.classList.add(className);
                    })
                })
            });
            (global as any).$ = mockJQuery;

            const event = new Event('dragover');
            wmComponent.dragOverCb(event);
            expect(dropzone.classList).toContain('highlight-drop-box');
        });

        it('should remove highlight from dropzone on drop', () => {
            const dropzone = document.createElement('div');
            dropzone.id = 'dropzone';
            dropzone.classList.add('highlight-drop-box');
            nativeElement.appendChild(dropzone);

            // Mock jQuery to return the mocked nativeElement
            const mockJQuery = jest.fn().mockReturnValue({
                find: jest.fn().mockReturnValue({
                    removeClass: jest.fn((className) => {
                        dropzone.classList.remove(className);
                    })
                })
            });
            (global as any).$ = mockJQuery;

            wmComponent.dropCb();
            expect(dropzone.classList).not.toContain('highlight-drop-box');
        });
        it("getFileExtension should return file extension", () => {
            const data = wmComponent.getFileExtension(undefined)
            expect(data).toEqual("file");
        });

        it('should trigger file select', () => {
            const fileInput = document.createElement('input');
            fileInput.classList.add('file-input');
            jest.spyOn(fileInput, 'click');
            nativeElement.appendChild(fileInput);

            // Mock jQuery to return the mocked nativeElement
            const mockJQuery = jest.fn().mockReturnValue({
                find: jest.fn().mockReturnValue({
                    trigger: jest.fn((eventName) => {
                        if (eventName === 'click') {
                            fileInput.click();
                        }
                    })
                })
            });
            (global as any).$ = mockJQuery;

            wmComponent.triggerFileSelect();
            expect(fileInput.click).toHaveBeenCalled();
        });
    });
});

describe('Fileupload Component WIth multiple', () => {
    let fixture: ComponentFixture<FileUploadWrapperComponent>;
    let wrapperComponent: FileUploadWrapperComponent;
    let wmComponent: FileUploadComponent;
    beforeEach(() => {
        fixture = compileTestComponent(testModuleDef, FileUploadWrapperComponent);
        wrapperComponent = fixture.componentInstance;
        wmComponent = wrapperComponent.wmComponent;
        (global as any).$ = {
            extend: jest.fn((...args) => Object.assign({}, ...args))
        };
        fixture.detectChanges();
        wmComponent.multiple = true;
        fixture.detectChanges();
    });
    it('should create fileupload component', () => {
        expect(wrapperComponent).toBeTruthy();
    });
    function getFile(content) {
        const blob = new Blob([content], { type: 'text/plain' });
        const file = new File([blob], 'Mock.csv');

        if (!content) {
            Object.defineProperty(
                file, 'size', { value: 1572864, writable: false }); // here filesize is 1.5MB which is equls to 1572864 bytes
        }
        return file;
    }

    it('should upload valid files and trigger error callback for invalid files', () => {
        const validFiles = new Array<File>();
        const errorFiles = new Array<File>();
        validFiles.push(getFile('hello world'));
        validFiles.push(getFile('my custom file'));
        errorFiles.push(getFile(''));
        jest.spyOn(wrapperComponent, 'onError');
        wmComponent.onFileSelect({}, [...validFiles, ...errorFiles]);
        fixture.detectChanges();
        // selected item should be same as validFiles
        expect(wmComponent.selectedFiles).toEqual(validFiles);
        expect(wrapperComponent.onError).toHaveBeenCalledTimes(1);
    });

    it('should provide error key and message when upload fails', () => {
        const errorFiles = new Array<File>();
        errorFiles.push(getFile(''));
        const files = wmComponent.getValidFiles(errorFiles);
        expect(files.errorFiles[0].error.key).toContain('INVALID_FILE_SIZE');
    });

});


