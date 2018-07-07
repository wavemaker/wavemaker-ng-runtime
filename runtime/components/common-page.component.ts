import { Component, ElementRef, ViewContainerRef } from '@angular/core';

import { App } from '@wm/core';
import { RenderPageService } from '../services/render-utils/render-page.service';

@Component({
    selector: 'app-common-page',
    template: '<div></div>'
})
export class CommonPageComponent {
    constructor(
        private vcRef: ViewContainerRef,
        private elRef: ElementRef,
        private renderPageService: RenderPageService,
        private app: App
    ) {

        if (this.app.isApplicationType) {
            this.renderPageService.render('Common', this.vcRef, this.elRef.nativeElement);
        }
    }
}
