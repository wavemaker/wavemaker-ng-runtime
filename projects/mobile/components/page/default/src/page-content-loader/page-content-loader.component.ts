import { Component, ElementRef } from '@angular/core';

import { addClass } from '@wm/core';
import { provideAsWidgetRef } from '@wm/components/base';

@Component({
    selector: '[wmPageContentLoader]',
    standalone: false,
    templateUrl: './page-content-loader.component.html',
    providers: [
        provideAsWidgetRef(PageContentLoaderComponent)
    ]
})
export class PageContentLoaderComponent {

    constructor(el: ElementRef) {
        addClass(el.nativeElement, 'app-page-content-loader');
    }
}
