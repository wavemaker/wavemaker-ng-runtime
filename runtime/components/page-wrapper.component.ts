import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationRef, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';

import { MetadataService } from '@wm/variables';
import { SecurityService } from '@wm/security';
import { App } from '@wm/core';

import { RenderUtilsService } from '../services/render-utils.service';
import { Subscription } from 'rxjs/Subscription';
import { AppManagerService } from '../services/app.manager.service';
import { SpinnerService } from '../services/spinner.service';

declare const _WM_APP_PROPERTIES;

@Component({
    selector: 'app-page-outlet',
    template: '<div></div>'
})
export class PageWrapperComponent implements OnInit, OnDestroy {

    subscription: Subscription;

    constructor(
        private route: ActivatedRoute,
        private renderUtils: RenderUtilsService,
        private vcRef: ViewContainerRef,
        private appRef: ApplicationRef,
        private metadataService: MetadataService,
        private securityService: SecurityService,
        private appManager: AppManagerService,
        private app: App,
        private ngZone: NgZone,
        private elRef: ElementRef,
        private spinnerService: SpinnerService
    ) {}

    getTargetNode() {
        return this.elRef.nativeElement;
    }

    resetViewContainer() {
        this.vcRef.clear();
        const $target = this.getTargetNode();
        $target.innerHTML = '';
    }

    renderPage(pageName) {
        this.resetViewContainer();
        const $target = this.getTargetNode();

        const spinnerId = this.spinnerService.show('', 'globalSpinner');

        this.appManager.loadAppVariables()
            .then( () => {
                this.renderUtils.renderPage(
                    pageName,
                    this.vcRef,
                    $target
                )
                    .then(() => {
                        this.spinnerService.hide(spinnerId)
                    });
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
            this.subscription = this.route.params.subscribe(({pageName}: any) => {
                this.ngZone.run(() => {
                    if (pageName) {
                        if (pageName === 'prefab-preview') {
                            this.renderPrefabPreviewPage();
                        } else {
                            this.renderPage(pageName);
                        }
                    }
                });
            });
        }
    }

    ngOnDestroy() {
        this.vcRef.clear();
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}

@Component({
    selector: 'app-empty-page',
    template: '<div></div>'
})
export class EmptyPageComponent implements OnInit {

    constructor(
        private route: ActivatedRoute,
        private securityService: SecurityService,
        private router: Router,
        private app: App
    ) {}

    ngOnInit() {
        if (this.app.isPrefabType) {
            // there is only one route
            this.router.navigate(['prefab-preview']);
        } else {
            if (this.app.isApplicationType) {
                this.securityService.getPageByLoggedInUser().then(page => {
                    this.router.navigate([page]);
                });
            } else {
                this.router.navigate([_WM_APP_PROPERTIES.homePage]);
            }
        }
    }
}