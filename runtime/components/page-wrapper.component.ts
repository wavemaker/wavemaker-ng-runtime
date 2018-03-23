declare const _WM_APP_PROPERTIES;
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationRef, Component, ViewContainerRef } from '@angular/core';
import { RenderUtilsService } from '../services/render-utils.service';
import { MetadataService } from '@variables/services/metadata-service/metadata.service';
import { SecurityService } from './../services/security.service';


@Component({
    selector: 'app-page-outlet',
    template: '<div></div>'
})
export class PageWrapperComponent {
    constructor(private route: ActivatedRoute,
                private renderUtils: RenderUtilsService,
                private vcRef: ViewContainerRef,
                private appRef: ApplicationRef,
                private metadataService: MetadataService,
                private securityService: SecurityService,
                private routerService: Router) {
        this.metadataService.load();
    }

    renderPage(pageName) {
        this.vcRef.clear();

        this.renderUtils.renderPage(
            pageName,
            this.vcRef,
            this.appRef.components[0].location.nativeElement
        );
    }

    ngOnInit() {
        this.route.params.subscribe(({ pageName }) => {
            if (pageName) {
                this.renderPage(pageName);
            } else {
                const homePage = _WM_APP_PROPERTIES.homePage;
                this.routerService.navigate([`/${homePage}`]);
            }
        });
    }
}