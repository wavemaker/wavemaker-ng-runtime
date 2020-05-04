import {ActivatedRouteSnapshot, CanDeactivate, Resolve, RouterStateSnapshot} from '@angular/router';
import {Injectable, Injector} from '@angular/core';
import {Observable} from 'rxjs';


export interface CanComponentDeactivate  {
    canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

   // canDeactivate guard for preview/WM deployment
@Injectable()
export class CanDeactivatePageGuard implements CanDeactivate<CanComponentDeactivate> {
    canDeactivate(component: CanComponentDeactivate, route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return component.canDeactivate ? component.canDeactivate() : true;
    }
}

/*
    [WMS-18847] - canDeactivate guard for angular deployment.
    As component.canDeactivate() is not part of basePageComponent, custom implementation of canDeactivate
    is added(implementation taken from page-wrapper.component.ts -> canDeactivate())
*/
@Injectable()
export class CanDeactivateNgPageGuard implements CanDeactivate<CanComponentDeactivate> {
    canDeactivate(component: CanComponentDeactivate, route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        function invokeCompDeactivate() {
            let retVal;
            // Calling onBeforePageLeave method present at page level
            retVal = this.onBeforePageLeave();
            // Calling onBeforePageLeave method present at app level only if page level method return true
            // or if there is no page level method
            if (retVal !== false ) {
                retVal =  (this.App.onBeforePageLeave || this.noop)(this.App.activePageName, this.App.activePage);
            }
            return retVal === undefined ? true : retVal;
        }
        return invokeCompDeactivate.apply(component);
    }
}
