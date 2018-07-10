import { AfterViewInit, Directive } from '@angular/core';

import { PageContentComponent, PageDirective } from '@wm/components';
import { addClass, App, removeClass } from '@wm/core';

@Directive({
    selector: '[wmPageContent]'
})
export class PageContentDirective implements AfterViewInit {

    constructor(private app: App, private pageContentComponent: PageContentComponent) {
        this.pageContentComponent.isContentLoading = true;
        this.pageContentComponent.hideContent = true;
    }

    public ngAfterViewInit() {
        if (this.pageContentComponent.$element.closest('[wmpartial]').length === 0) {
            addClass(this.pageContentComponent.getNativeElement(), 'load');
            const unsubscribe = this.app.subscribe('pageStartupdateVariablesLoaded', (data) => {
                if (data.pageName === this.app.activePageName) {
                    this.pageContentComponent.hideContent = false;
                    // wait for compilation
                    setTimeout(() => {
                        this.pageContentComponent.isContentLoading = false;
                        removeClass(this.pageContentComponent.getNativeElement(), 'load');
                    }, 300);
                    unsubscribe();
                }
            });
        } else {
            setTimeout(() => {
                this.pageContentComponent.isContentLoading = false;
                this.pageContentComponent.hideContent = false;
            }, 0);
        }
    }
}