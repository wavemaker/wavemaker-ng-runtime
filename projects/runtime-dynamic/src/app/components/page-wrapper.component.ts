import {
    ApplicationRef,
    Component,
    ElementRef,
    Injector,
    NgZone,
    OnDestroy,
    OnInit,
    ViewContainerRef,
    HostListener
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { AbstractSpinnerService, App, noop} from '@wm/core';
import { MetadataService } from '@wm/variables';
import { SecurityService } from '@wm/security';
import { AppManagerService, ComponentRefProvider, ComponentType } from '@wm/runtime/base';

@Component({
    selector: 'app-page-outlet',
    template: '<div></div>'
})
export class PageWrapperComponent implements OnInit, OnDestroy {

    subscription: Subscription;

    constructor(
        private injector: Injector,
        private route: ActivatedRoute,
        private vcRef: ViewContainerRef,
        private appRef: ApplicationRef,
        private metadataService: MetadataService,
        private securityService: SecurityService,
        private appManager: AppManagerService,
        private app: App,
        private ngZone: NgZone,
        private elRef: ElementRef,
        private spinnerService: AbstractSpinnerService,
        private componentRefProvider: ComponentRefProvider,
        private router: Router
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
        const $target = this.getTargetNode();

        this.appManager.loadAppVariables()
            .then(async () => {
                const pageComponentFactoryRef = await this.componentRefProvider.getComponentFactoryRef(pageName, ComponentType.PAGE);
                if (pageComponentFactoryRef) {
                    const instance = this.vcRef.createComponent(pageComponentFactoryRef, 0, this.injector);
                    $target.appendChild(instance.location.nativeElement);
                }
                if (this.vcRef.length > 1) {
                    this.vcRef.remove(1);
                }
            });
    }

    renderPrefabPreviewPage() {
        this.router.navigate(['prefab-preview']);
    }

    loadPage(pageName) {
        this.ngZone.run(() => {
            if (pageName) {
                this.renderPage(pageName);
            }
        });
    }

    ngOnInit() {
        if (this.app.isPrefabType) {
            // there is only one route
            this.renderPrefabPreviewPage();
        } else {
            $(this.getTargetNode()).find('>div:first-child').remove();
            this.subscription = this.route.params.subscribe(({pageName}: any) => {
               this.loadPage(pageName);
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
