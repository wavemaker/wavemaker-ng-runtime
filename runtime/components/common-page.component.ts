import { Component, ElementRef, ViewContainerRef } from '@angular/core';

import { App } from '@wm/core';

import { PageRenderer } from '../services/render-utils/page-renderer';

@Component({
    selector: 'app-common-page',
    template: '<div></div>'
})
export class CommonPageComponent {
    constructor(
        private vcRef: ViewContainerRef,
        private elRef: ElementRef,
        private pageRenderer: PageRenderer,
        private app: App
    ) {

        if (this.app.isApplicationType) {
            this.pageRenderer.render('Common', this.vcRef, this.elRef.nativeElement);
        }
    }
}
