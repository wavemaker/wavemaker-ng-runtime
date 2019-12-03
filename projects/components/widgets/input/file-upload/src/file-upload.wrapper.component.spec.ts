import { ComponentFixture } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { App} from '@wm/core';
import { FileUploadComponent } from './file-upload.component';
import { ComponentsTestModule} from '../../../../base/src/test/components.test.module';
import { ComponentTestBase, ITestComponentDef, ITestModuleDef  } from '../../../../base/src/test/common-widget.specs';
import { compileTestComponent } from '../../../../base/src/test/util/component-test-util';
import { FileSizePipe, FileIconClassPipe, StateClassPipe } from '../../../../base/src/pipes/custom-pipes';

const mockApp = {
    notifyApp: function () {}
};
const markup =  `<div wmFileUpload name="testfileupload" select.event="onSelect($event, widget, selectedFiles)" error.event="onError($event, widget, files)" role="input"></div>`;

@Component({
    template: markup
})

class FileUploadWrapperComponent {
    @ViewChild(FileUploadComponent)
    wmComponent: FileUploadComponent;
    files: Array<File>;

    onSelect = function ($event, widget, selectedFiles) {
        console.log('select event triggered');
    };

    onError = function ($event, wiidget, files) {
        console.log('error event triggered', files);
    };
}

const testModuleDef: ITestModuleDef = {
    declarations: [FileUploadWrapperComponent, FileUploadComponent, FileSizePipe, FileIconClassPipe, StateClassPipe],
    imports: [ComponentsTestModule],
    providers: [{provide: App, useValue: mockApp}]
};

const componentDef: ITestComponentDef = {
    $unCompiled: $(markup),
    type: 'wm-fileupload',
    widgetSelector: '[wmFileUpload]',
    testModuleDef: testModuleDef,
    testComponent: FileUploadWrapperComponent
};

// const TestBase: ComponentTestBase = new ComponentTestBase(componentDef);
// TestBase.verifyPropsInitialization();
// TestBase.verifyCommonProperties();
// TestBase.verifyStyles();

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
            file, 'size', {value: 1572864, writable: false}); // here filesize is 1.5MB which is equls to 1572864 bytes
        files.push(file);
        return files;
    }

    it ('should upload the selected file',  () => {
        const mockFiles = getFile();
        wmComponent.onFileSelect({}, mockFiles);
        fixture.detectChanges();
        // selected item should be same as mockFile
        expect(wmComponent.selectedFiles).toEqual(mockFiles);
    });

    it ('should trigger error callback if filesize exceeds 1MB', () => {
        const mockFiles = getHugeFile();
        spyOn(wrapperComponent, 'onError');
        wmComponent.onFileSelect({}, mockFiles);
        fixture.detectChanges();
        expect(wrapperComponent.onError).toHaveBeenCalledTimes(1);
    });
});

describe('Fileupload Component WIth multiple', () => {
   let fixture:  ComponentFixture<FileUploadWrapperComponent>;
   let wrapperComponent: FileUploadWrapperComponent;
   let wmComponent: FileUploadComponent;
   beforeEach(() => {
       fixture = compileTestComponent(testModuleDef, FileUploadWrapperComponent);
       wrapperComponent = fixture.componentInstance;
       wmComponent = wrapperComponent.wmComponent;
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
                file, 'size', {value: 1572864, writable: false}); // here filesize is 1.5MB which is equls to 1572864 bytes
        }
        return file;
    }

    it('should upload valid files and trigger error callback for invalid files', () => {
        const validFiles = new Array<File>();
        const errorFiles  = new Array<File>();
        validFiles.push(getFile('hello world'));
        validFiles.push(getFile('my custom file'));
        errorFiles.push(getFile(''));
        spyOn(wrapperComponent, 'onError');
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


