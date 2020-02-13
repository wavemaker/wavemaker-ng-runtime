import {ActivatedRouteSnapshot, CanDeactivate, Resolve, RouterStateSnapshot} from "@angular/router";
import {Injectable, Injector} from "@angular/core";
import {Observable} from "rxjs";


export interface CanComponentDeactivate  {
    canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable()
export class CanDeactivatePageGuard implements CanDeactivate<CanComponentDeactivate> {
    canDeactivate(component: CanComponentDeactivate, route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return component.canDeactivate ? component.canDeactivate() : true;
    }
}
