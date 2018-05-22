declare const _WM_APP_PROPERTIES;
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationRef, Component, OnInit, ViewContainerRef } from '@angular/core';
import { RenderUtilsService } from '../services/render-utils.service';
import { MetadataService } from '@wm/variables';
import { SecurityService } from '@wm/security';
import { App } from '../services/app.service';

@Component({
    selector: 'app-page-outlet',
    template: '<div></div>'
})
export class PageWrapperComponent implements OnInit {
    constructor(
        private route: ActivatedRoute,
        private renderUtils: RenderUtilsService,
        private vcRef: ViewContainerRef,
        private appRef: ApplicationRef,
        private metadataService: MetadataService,
        private securityService: SecurityService,
        private routerService: Router,
        private app: App
    ) {}

    renderPage(pageName) {
        this.vcRef.clear();

        this.renderUtils.renderPage(
            pageName,
            this.vcRef,
            this.appRef.components[0].location.nativeElement
        ).then(() => {
            this.app.internals.lastActivePageName = this.app.internals.activePageName;
            this.app.internals.activePageName = pageName;
        });
    }

    ngOnInit() {
        this.route.params.subscribe(({pageName}) => {
            if (pageName) {
                this.renderPage(pageName);
            } else {
                this.securityService.getPageByLoggedInUser().then(page => {
                    this.routerService.navigate([`/${page}`]);
                });
            }
        });
    }
}