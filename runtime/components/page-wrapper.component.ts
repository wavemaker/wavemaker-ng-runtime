import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationRef, Component, OnInit, ViewContainerRef } from '@angular/core';

import { MetadataService } from '@wm/variables';
import { SecurityService } from '@wm/security';
import { App } from '@wm/core';

import { RenderUtilsService } from '../services/render-utils.service';


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

    getTargetNode() {
        return this.appRef.components[0].location.nativeElement;
    }

    resetViewContainer() {
        this.vcRef.clear();
        const $target = this.getTargetNode();
        $target.innerHTML = '';
    }

    renderPage(pageName) {
        this.resetViewContainer();
        const $target = this.getTargetNode();

        this.renderUtils.renderPage(
            pageName,
            this.vcRef,
            $target
        ).then(() => {
            this.app.internals.lastActivePageName = this.app.internals.activePageName;
            this.app.internals.activePageName = pageName;
        });
    }

    renderPrefabPreviewPage() {
        this.resetViewContainer();
        const $target = this.getTargetNode();

        this.renderUtils.renderPrefabPreviewPage(
            this.vcRef,
            $target
        );
    }

    ngOnInit() {
        if (this.app.isPrefabType) {
            // there is only one route
            this.renderPrefabPreviewPage();
        } else {
            this.route.params.subscribe(({pageName}) => {
                if (pageName) {
                    this.renderPage(pageName);
                } else {
                    if (this.app.isApplicationType) {
                        this.securityService.getPageByLoggedInUser().then(page => {
                            this.routerService.navigate([`/${page}`]);
                        });
                    } else {
                        this.routerService.navigate(['/Main']);
                    }
                }
            });
        }
    }
}
