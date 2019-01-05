import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { App, getWmProjectProperties } from '@wm/core';
import { SecurityService } from '@wm/security';
import { AppManagerService } from '@wm/runtime/base';

@Component({
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
    ) {}

    ngOnInit() {
        if (this.app.isPrefabType) {
            // there is only one route
            this.router.navigate(['prefab-preview']);
        } else  if (this.app.isApplicationType) {
            this.securityService.getPageByLoggedInUser().then(page => {
                this.router.navigate([page]);
            });
        } else {
            this.router.navigate([getWmProjectProperties().homePage]);
            this.appManger.postAppTypeInfo();
        }
    }
}
