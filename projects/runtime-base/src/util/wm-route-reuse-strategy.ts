/*
Custom Route Reuse Strategies:
* WmDefaultRouteReuseStrategy: Base Function & Utils
* WmRouteReseStrategy : For Preview & WaveMaker Deployments
* WmNgRouteReuseStrategy : For Angular Deployments

When a user invokes navigation action from 'Page1' to 'Page2'
Reuse Route : True,
                    if the Page1 & Page2 are same with Same Query Params
Reuse Route : False,
                    if the Page1 & Page 2 are different,
                    if the Page1 & Page 2 are same, but the query params are different
*/
import {
    ActivatedRouteSnapshot,
    DetachedRouteHandle,
    RouteReuseStrategy,
} from '@angular/router';

/* Base Strategy with Default implementations */
class WmDefaultRouteReuseStrategy {
    protected getSize = (obj: object | null): number =>
        obj ? Object.keys(obj).length : 0;
    protected isSameQueryParams(future, current): boolean {
        try {
            const fqParams = future.queryParams;
            const cqParams = current.queryParams;
            const fqParamsCount = fqParams ? this.getSize(fqParams) : 0;
            const cqParamsCount = cqParams ? this.getSize(cqParams) : 0;

            if (fqParamsCount === 0 && cqParamsCount === 0) {
                return true;
            }
            if (fqParamsCount !== cqParamsCount) {
                return false;
            }
            return JSON.stringify(fqParams) === JSON.stringify(cqParams);
        } catch (e) {
            return false;
        }
    }
    // DefaultRouteReuseStrategy : Begin
    shouldDetach(route: ActivatedRouteSnapshot): boolean {
        return false;
    }
    shouldAttach(route: ActivatedRouteSnapshot): boolean {
        return false;
    }
    store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {}
    retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
        return null;
    }
    // DefaultRouteReuseStrategy : End
}
/* Custom Strategy specifically for preview & WaveMaker Deployments */
export class WmRouteReuseStrategy extends WmDefaultRouteReuseStrategy
    implements RouteReuseStrategy {
    private isSameRoute(future, current): boolean {
        // Incase of prefab project we have only one route So reloading the route everytime
        if (future.routeConfig && future.routeConfig.path === 'prefab-preview') {
            return false;
        }
        /*
        In WM Deployment, Navigation is handled by PageWrapperComponent
                          & Route Info is passed as a parameter
        */
        const fParams = future.params;
        const cParams = current.params;
        const fParamsCount = this.getSize(fParams);
        const cParamsCount = this.getSize(cParams);
        if (fParamsCount === 0 && cParamsCount === 0) {
            return true;
        }
        if (fParamsCount !== cParamsCount) {
            return false;
        }
        if (fParams['pageName'] === cParams['pageName']) {
            return this.isSameQueryParams(future, current);
        }
        return true;
    }
    shouldReuseRoute(
        future: ActivatedRouteSnapshot,
        current: ActivatedRouteSnapshot
    ): boolean {
        return this.isSameRoute(future, current);
    }
}
/* Custom Strategy specifically for Angular Deployments */
export class WmNgRouteReuseStrategy extends WmDefaultRouteReuseStrategy
    implements RouteReuseStrategy {
    private isSameRoute(future, current): boolean {
        /*
        In Angular Deployment, Navigation is handled by Angular
                               & Route Info is passed by routeConfig
        */
        if (!future.routeConfig && !current.routeConfig) {
            return true;
        }
        if (future.routeConfig !== current.routeConfig) {
            return false;
        }
        if (future.routeConfig === current.routeConfig) {
            return this.isSameQueryParams(future, current);
        }
        return true;
    }
    shouldReuseRoute(
        future: ActivatedRouteSnapshot,
        current: ActivatedRouteSnapshot
    ): boolean {
        return this.isSameRoute(future, current);
    }
}
