import { Directive } from '@angular/core';

import { FileUploadComponent } from '@wm/components';
import { hasCordova } from '@wm/core';
import { FileContent, FileSelectorService } from './../../services/file-selector.service';

declare const _;

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
        const multiple = this.fileUploadComponent['multiple'];
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