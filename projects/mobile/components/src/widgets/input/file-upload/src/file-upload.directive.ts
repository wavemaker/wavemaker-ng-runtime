import { Directive } from '@angular/core';

import { FileUploadComponent } from '@wm/components/input/file-upload';
import { hasCordova } from '@wm/core';

import { FileContent, FileSelectorService } from '@wm/mobile/components/basic';

@Directive({
    selector: '[wmFileUpload]'
})
export class FileUploadDirective {

    constructor(
        private fileSelectorService: FileSelectorService,
        private fileUploadComponent: FileUploadComponent
    ) {
        fileUploadComponent._isMobileType = true;
        fileUploadComponent._isCordova = hasCordova();
        fileUploadComponent['openFileSelector'] = () => {
            this.openFileSelector().then((contents: FileContent[]) => {
                this.fileUploadComponent.onFileSelect({}, contents);
            });
        };
    }

    public openFileSelector(): Promise<FileContent[]> {
        switch (this.fileUploadComponent['contenttype']) {
            case 'image':
                return this.fileSelectorService.selectImages();
            case 'video':
                return this.fileSelectorService.selectVideos();
            case 'audio':
                return this.fileSelectorService.selectAudio();
            default:
                return this.fileSelectorService.selectFiles();
        }
    }
}
