import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

import { hasCordova } from '@wm/core';
import { FileBrowserComponent, FileSelectorService } from '@wm/mobile/components';

@Component({
    selector: '[wmAppExt]',
    template: `<ng-container>
        <div wmNetworkInfoToaster></div>
        <div wmAppUpdate></div>
        <div wmMobileFileBrowser></div>
    </ng-container>`
})
export class AppExtComponent implements AfterViewInit {

    @ViewChild(FileBrowserComponent) fileBrowserComponent: FileBrowserComponent;

    constructor(private elRef: ElementRef, private fileSelectorService: FileSelectorService) {}

    ngAfterViewInit() {
        const mobileElements = $(this.elRef.nativeElement).find('>[wmNetworkInfoToaster], >[wmAppUpdate], >[wmMobileFileBrowser]');
        const $body = $('body:first');
        if (hasCordova()) {
            mobileElements.appendTo($body);
            this.fileSelectorService.setFileBrowser(this.fileBrowserComponent);
        } else {
            mobileElements.remove();
        }
    }
}