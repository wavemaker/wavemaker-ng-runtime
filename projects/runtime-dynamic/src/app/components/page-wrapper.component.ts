import { WmComponentsModule } from "@wm/components/base";
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
import { AppManagerService, BasePageComponent, ComponentRefProvider, ComponentType } from '@wm/runtime/base';

@Component({
  standalone: true,
  imports: [WmComponentsModule],
    selector: 'app-page-outlet',
    template: '<div></div>'
})
export class PageWrapperComponent implements OnInit, OnDestroy {

    subscription: Subscription;
    instance: any;

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
                // Properly destroy old page component before creating new one
                if (this.instance && this.instance.ngOnDetach) {
                    this.instance.ngOnDetach();
                }
                
                // CRITICAL FIX: Remove manually appended DOM nodes from previous page
                // This prevents detached DOM nodes from staying in memory
                while ($target.firstChild) {
                    $target.removeChild($target.firstChild);
                }
                
                // Clear App.activePage reference to allow old page to be garbage collected
                // This is critical because App is a singleton service
                if (this.app.activePage) {
                    this.app.activePage = null;
                }
                
                // Clear previous components to prevent memory leaks
                if (this.vcRef.length > 0) {
                    this.vcRef.clear();
                }
                
                const pageComponentFactoryRef = await this.componentRefProvider.getComponentFactoryRef(pageName, ComponentType.PAGE);
                if (pageComponentFactoryRef) {
                    const componentRef = this.vcRef.createComponent(pageComponentFactoryRef, 0, this.injector);
                    this.instance = componentRef.instance;
                    $target.appendChild(componentRef.location.nativeElement);
                } else {
                    BasePageComponent.clear();
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
            $(this.getTargetNode()).find('>div').first().remove();
            this.subscription = this.route.params.subscribe(({pageName}: any) => {
               this.loadPage(pageName);
            });
        }
    }

    ngOnDestroy() {
        // Clean up old page instance reference
        if (this.instance && this.instance.ngOnDetach) {
            this.instance.ngOnDetach();
        }
        
        // Remove all DOM children to prevent memory leaks
        const $target = this.getTargetNode();
        while ($target.firstChild) {
            $target.removeChild($target.firstChild);
        }
        
        // Clear App.activePage reference
        if (this.app.activePage) {
            this.app.activePage = null;
        }
        
        // Clear ViewContainerRef
        this.vcRef.clear();
        
        // Unsubscribe from route params
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
        
        // Clear instance reference
        this.instance = null;
    }

    ngOnAttach() {
        this.getTargetNode().appendChild(this.instance.$page[0]);
        this.instance.ngOnAttach();
    }

    ngOnDetach() {
        this.instance.ngOnDetach();
    }
}
