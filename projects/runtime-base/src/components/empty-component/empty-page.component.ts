import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { App, getWmProjectProperties } from '@wm/core';
import { SecurityService } from '@wm/security';

import { AppManagerService } from '../../services/app.manager.service';

@Component({
    standalone: true,
    selector: 'app-empty-page',
    template: '<div></div>'
})
export class EmptyPageComponent implements OnInit {

    constructor(
        private route: ActivatedRoute,
        private securityService: SecurityService,
        private router: Router,
        private app: App,
        private appManger: AppManagerService
    ) { }

    private parseSearchParams(search: string): Record<string, string> {
        const params: Record<string, string> = {};
        const sp = new URLSearchParams(search);
        sp.forEach((v, k) => params[k] = v);
        return params;
    }

    ngOnInit() {
        if (this.app.isPrefabType) {
            // there is only one route
            this.router.navigate(['prefab-preview']);
        } else if (this.app.isApplicationType) {
            this.securityService.getPageByLoggedInUser().then(page => {

                // Fix redirect from IDP: move query params from before the hash to after it.
                // Angular with HashLocationStrategy ignores pre-hash query params, so using router.navigate()
                // would produce URLs like .../?param=123#/Main, dropping the params from the router.
                // we manually rebuild the correct and use history.replaceState to rewrite the URL as .../#/Main?param=123,
                // ensuring query params are preserved and Angular routing works correctly.
                const { search, hash, origin, pathname } = window.location;
                const params = this.parseSearchParams(search);

                // Detect if params are before hash (i.e. in search) and not already after the hash
                const hasParamsBeforeHash = !!search;
                const hasParamsAfterHash = hash.includes('?');

                if (hasParamsBeforeHash && !hasParamsAfterHash) {
                    const newUrl = `${origin}${pathname}#/${page}${search}`;

                    // rewrite URL without reload
                    history.replaceState(null, '', newUrl);
                }

                this.router.navigate([page], { queryParams: params, replaceUrl: true });
            });
        } else {
            this.router.navigate([getWmProjectProperties().homePage]);
            this.appManger.postAppTypeInfo();
        }
    }
}
