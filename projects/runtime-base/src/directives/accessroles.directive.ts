import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

import { SecurityService } from '@wm/security';

declare const _;

enum USER_ROLE {
    EVERYONE = 'Everyone',
    ANONYMOUS = 'Anonymous',
    AUTHENTICATED = 'Authenticated'
}

@Directive({
    selector: '[accessroles]'
})
export class AccessrolesDirective {

    private processed = false;
    private readonly isUserAuthenticated;
    private readonly userRoles;
    private securityEnabled: boolean;

    constructor(
        private templateRef: TemplateRef<any>,
        private viewContainerRef: ViewContainerRef,
        private securityService: SecurityService
    ) {
        const securityConfig = this.securityService.get();
        this.securityEnabled = securityConfig.securityEnabled;
        this.isUserAuthenticated = _.get(securityConfig, 'authenticated');
        this.userRoles = _.get(securityConfig, 'userInfo.userRoles');
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
        return _.split(val, ',').map(function (v) {
            return _.trim(v).replace(UNICODE_COMMA_REGEX, ',');
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
            return _.includes(userRoles, item);
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
        if (_.includes(widgetRoles, USER_ROLE.EVERYONE)) {
            return true;
        }

        // access the widget when 'Anonymous' is chosen and user is not authenticated
        if (_.includes(widgetRoles, USER_ROLE.ANONYMOUS) && !this.isUserAuthenticated) {
            return true;
        }

        // access the widget when 'Only Authenticated Users' is chosen and user is authenticated
        if (_.includes(widgetRoles, USER_ROLE.AUTHENTICATED) && this.isUserAuthenticated) {
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
            this.viewContainerRef.createEmbeddedView(this.templateRef);
        } else {
            this.viewContainerRef.clear();
        }
    }
}
