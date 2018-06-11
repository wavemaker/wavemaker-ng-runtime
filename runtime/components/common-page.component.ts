import { Component, ElementRef, ViewContainerRef } from '@angular/core';

import { App } from '@wm/core';

import { RenderUtilsService } from '../services/render-utils.service';

@Component({
    selector: 'app-common-page',
    template: '<div></div>'
})
export class CommonPageComponent {
    constructor(
        private vcRef: ViewContainerRef,
        private elRef: ElementRef,
        private renderUtils: RenderUtilsService,
        private app: App
    ) {

        if (this.app.isApplicationType) {
            this.renderUtils.renderPage('Common', this.vcRef, this.elRef.nativeElement);
        }
    }
}
