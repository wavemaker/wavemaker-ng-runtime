import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

import { hasCordova } from '@wm/core';
import { FileBrowserComponent, FileSelectorService, ProcessManagerComponent, ProcessManagementService } from '@wm/mobile/components/basic';

@Component({
    selector: '[wmAppExt]',
    template: `<ng-container> 
        <div wmNetworkInfoToaster></div>
        <div wmAppUpdate></div>
        <div wmMobileFileBrowser></div>
        <div wmProcessManager></div>
    </ng-container>`
})
export class AppExtComponent implements AfterViewInit {

    @ViewChild(FileBrowserComponent) fileBrowserComponent: FileBrowserComponent;

    @ViewChild(ProcessManagerComponent) processManagerComponent: ProcessManagerComponent;

    constructor(
        private elRef: ElementRef,
        private fileSelectorService: FileSelectorService,
        private processManagementService: ProcessManagementService
    ) {}

    ngAfterViewInit() {
        const mobileElements = $(this.elRef.nativeElement).find('>[wmNetworkInfoToaster], >[wmAppUpdate], >[wmMobileFileBrowser]');
        const $body = $('body');
        if (hasCordova()) {
            mobileElements.appendTo($body);
            this.fileSelectorService.setFileBrowser(this.fileBrowserComponent);
        } else {
            mobileElements.remove();
        }
        $(this.elRef.nativeElement).find('>[wmProgressManager]').appendTo($body);
        this.processManagementService.setUIComponent(this.processManagerComponent);
    }
}
