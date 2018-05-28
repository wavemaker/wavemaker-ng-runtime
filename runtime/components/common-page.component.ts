import { ApplicationRef, Component, DoCheck, ElementRef, ViewContainerRef } from '@angular/core';
import { $invokeWatchers } from '@wm/core';
import { RenderUtilsService } from '../services/render-utils.service';

@Component({
    selector: 'div#wm-common-content',
    template: '<div></div>'
})
export class CommonPageComponent implements DoCheck {
    constructor(private appRef: ApplicationRef,
                private vcRef: ViewContainerRef,
                private elRef: ElementRef,
                private renderUtils: RenderUtilsService) {
        console.log('common page load');
        this.renderUtils.renderPage('Common', this.vcRef, this.elRef.nativeElement);
    }

    ngDoCheck() {
        $invokeWatchers();
    }
}
