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
            this.openFileSelector(fileUploadComponent.multiple).then((contents: FileContent[]) => {
                this.fileUploadComponent.onFileSelect({}, contents);
            });
        };
    }

    public openFileSelector(multiple): Promise<FileContent[]> {
        switch (this.fileUploadComponent['contenttype']) {
            case 'image':
                return this.fileSelectorService.selectImages(multiple);
            case 'video':
                return this.fileSelectorService.selectVideos(multiple);
            case 'audio':
                return this.fileSelectorService.selectAudio(multiple);
            default:
                return this.fileSelectorService.selectFiles(multiple);
        }
    }
}
