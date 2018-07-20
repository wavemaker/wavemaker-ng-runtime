import { Directive } from '@angular/core';

import { PageContentComponent } from '@wm/components';
import { addClass, App, removeClass } from '@wm/core';
import { MobilePageDirective } from '../page/page.directive';

@Directive({
    selector: '[wmPageContent]'
})
export class PageContentDirective {

    constructor(app: App, page: MobilePageDirective, pageContentComponent: PageContentComponent) {
        const pageName = app.activePageName;
        if (page.showLoader) {
            page.showLoader = false;
            pageContentComponent.isContentLoading = true;
            pageContentComponent.hideContent = true;
            addClass(pageContentComponent.getNativeElement(), 'load');
            const unsubscribe = app.subscribe('pageStartupdateVariablesLoaded', (data) => {
                if (data.pageName === pageName) {
                    pageContentComponent.hideContent = false;
                    // wait for compilation
                    setTimeout(() => {
                        pageContentComponent.isContentLoading = false;
                        removeClass(pageContentComponent.getNativeElement(), 'load');
                        app.notify('pageContentReady');
                    }, 300);
                    unsubscribe();
                }
            });
        }
    }
}