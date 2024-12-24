import {Directive, Inject, Injector, Input, Optional, TemplateRef, ViewContainerRef} from '@angular/core';

import {SecurityService} from '@wm/security';
import {extend, get, includes, split, trim} from "lodash-es";

enum USER_ROLE {
    EVERYONE = 'Everyone',
    ANONYMOUS = 'Anonymous',
    AUTHENTICATED = 'Authenticated'
}

@Directive({
    selector: '[accessroles]',
    standalone: false
})
export class AccessrolesDirective {

    private processed = false;
    private readonly isUserAuthenticated;
    private readonly userRoles;
    private readonly context = {};
    private securityEnabled: boolean;

    constructor(
        private templateRef: TemplateRef<any>,
        private viewContainerRef: ViewContainerRef,
        private securityService: SecurityService,
        private inj: Injector,
        @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any
    ) {
        const securityConfig = this.securityService.get();
        this.securityEnabled = get(securityConfig, 'securityEnabled');
        this.isUserAuthenticated = get(securityConfig, 'authenticated');
        this.userRoles = get(securityConfig, 'userInfo.userRoles');
        extend(this.context, (inj as any)._lView[8], explicitContext);
    }

    /**
     * Returns array of roles from comma separated string of roles
     * Handles encoded commas
     * @param val
     * @returns {any}
     */
    private getWidgetRolesArrayFromStr(val) {
        const UNICODE_COMMA_REGEX = /&#44;/g;

        val = val || '';
        if (val === '') {
            return [];
        }
        // replace the unicode equivalent of comma with comma
        return split(val, ',').map(function (v) {
            return trim(v).replace(UNICODE_COMMA_REGEX, ',');
        });
    }

    /**
     * Returns true if roles in first arrays is
     * @param widgetRoles
     * @param userRoles
     * @returns {any}
     */
    private matchRoles(widgetRoles, userRoles) {
        return widgetRoles.some(function (item) {
            return includes(userRoles, item);
        });
    }

    /**
     * Decides whether the current logged in user has access to widget or not
     * @param widgetRoles
     * @param userRoles
     * @returns {any}
     */
    private hasAccessToWidget(widgetRoles, userRoles) {
        // access the widget when 'Everyone' is chosen
        if (includes(widgetRoles, USER_ROLE.EVERYONE)) {
            return true;
        }

        // access the widget when 'Anonymous' is chosen and user is not authenticated
        if (includes(widgetRoles, USER_ROLE.ANONYMOUS) && !this.isUserAuthenticated) {
            return true;
        }

        // access the widget when 'Only Authenticated Users' is chosen and user is authenticated
        if (includes(widgetRoles, USER_ROLE.AUTHENTICATED) && this.isUserAuthenticated) {
            return true;
        }

        // access the widget when widget role and logged in user role matches
        return this.isUserAuthenticated && this.matchRoles(widgetRoles, userRoles);
    }

    @Input() set accessroles(roles) {
        // flag to compute the directive only once
        if (this.processed) {
            return;
        }

        this.processed = true;
        const widgetRoles = this.getWidgetRolesArrayFromStr(roles);
        const isAccessible = !this.securityEnabled || this.hasAccessToWidget(widgetRoles, this.userRoles);
        if (isAccessible) {
            // [WMS-19294] pass on the previous context as second param.
            this.viewContainerRef.createEmbeddedView(this.templateRef, this.context);
        } else {
            this.viewContainerRef.clear();
        }
    }
}
