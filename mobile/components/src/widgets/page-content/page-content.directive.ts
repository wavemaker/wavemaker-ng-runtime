import { Directive } from '@angular/core';

import { PageContentComponent } from '@wm/components';
import { addClass, App, removeClass } from '@wm/core';
import { MobilePageDirective } from '../page/page.directive';

@Directive({
    selector: '[wmPageContent]'
})
export class PageContentDirective {

    constructor(app: App, page: MobilePageDirective, pageContentComponent: PageContentComponent) {
        if (page.showLoader) {
            page.showLoader = false;
            pageContentComponent.isContentLoading = true;
            pageContentComponent.hideContent = true;
            addClass(pageContentComponent.getNativeElement(), 'load');
            const unsubscribe = app.subscribe('pageStartupdateVariablesLoaded', (data) => {
                if (data.pageName === app.activePageName) {
                    pageContentComponent.hideContent = false;
                    // wait for compilation
                    setTimeout(() => {
                        pageContentComponent.isContentLoading = false;
                        removeClass(pageContentComponent.getNativeElement(), 'load');
                    }, 300);
                    unsubscribe();
                }
            });
        }
    }
}