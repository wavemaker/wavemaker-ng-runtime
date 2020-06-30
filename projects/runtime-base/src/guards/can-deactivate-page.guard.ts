import {ActivatedRouteSnapshot, CanDeactivate, Resolve, RouterStateSnapshot} from '@angular/router';
import {Injectable, Injector} from '@angular/core';
import {Observable} from 'rxjs';
import {noop} from '@wm/core';


export interface CanComponentDeactivate  {
    canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

/*
    canDeactivate guard for preview/WM deployment.
    [WMS-19159] - Moved CanDeactivate() from page-wrapper.component.ts to base-page.component.ts(which is common for both preview and angular)
    because beforepageleave is not calling for browser/tab close in angularmode
    here component is pagewrapper so adding custom implementation for route change
 */
@Injectable()
export class CanDeactivatePageGuard implements CanDeactivate<CanComponentDeactivate> {
  canDeactivate(component: CanComponentDeactivate, route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
      function invokeCompDeactivate() {
          let retVal;
          // Calling onBeforePageLeave method present at page level
          retVal = this.app.activePage && this.app.activePage.onBeforePageLeave();
          // Calling onBeforePageLeave method present at app level only if page level method return true
          // or if there is no page level method
          if (retVal !== false ) {
              retVal =  (this.app.onBeforePageLeave || noop)(this.app.activePageName, this.app.activePage);
          }
          return retVal === undefined ? true : retVal;
      }
      return invokeCompDeactivate.apply(component);
  }
}


//  [WMS-18847] - canDeactivate guard for angular deployment.
@Injectable()
export class CanDeactivateNgPageGuard implements CanDeactivate<CanComponentDeactivate> {
    canDeactivate(component: CanComponentDeactivate, route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return component.canDeactivate ? component.canDeactivate() : true;
    }
}
