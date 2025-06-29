import { Inject } from '@angular/core';
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

import { LRUCache } from '@wm/core';
import {isNil} from "lodash-es";
export const CACHE_PAGE = '_cache_page';
export const MAX_CACHE_SIZE = 'REUSE_ROUTE_STRATEGY.MAX_CACHE_SIZE';
export const MAX_CACHE_AGE = 'REUSE_ROUTE_STRATEGY.MAX_CACHE_AGE';

/* Base Strategy with Default implementations */
export class WmDefaultRouteReuseStrategy {
    private cache: LRUCache<DetachedRouteHandle>;
    private currentRouteKey: string;
    private paramsToIgnore = [
        'wm_state', // state persistence,
        CACHE_PAGE // to use page cache
    ];

    constructor(@Inject(MAX_CACHE_SIZE) maxCacheSize?: number,
                @Inject(MAX_CACHE_AGE) maxCacheAge?: number) {
        this.cache = new LRUCache<DetachedRouteHandle>(maxCacheSize, maxCacheAge, (key, handle) => {
            if (this.currentRouteKey === key) {
                this.cache.set(key, handle);
            } else {
                (handle as any).componentRef.destroy();
            }
        });
    }

    private getKey(route: ActivatedRouteSnapshot) {
        const queryParams = Object.keys(route.queryParams)
            .filter(k => !this.paramsToIgnore.includes(k))
            .map(k => k + '=' + route.queryParams[k])
            .sort().join('&');
        let pageName = route.params.pageName;
        if (route.data.pageName && route.routeConfig.path === route.data.pageName) {
            pageName = route.data.pageName;
        }
        return pageName && (pageName + (queryParams ? `?${queryParams}`: ''));
    }

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

    private isCacheEnabled(route: ActivatedRouteSnapshot, defaultValue: boolean) {
        const canReuse = route.queryParams[CACHE_PAGE];
        if (!isNil(canReuse)) {
            return (canReuse === 'true' || canReuse === true);
        }
        return defaultValue;
    }

    // DefaultRouteReuseStrategy : Begin
    shouldDetach(route: ActivatedRouteSnapshot): boolean {
        const key = this.getKey(route);
        if (this.isCacheEnabled(route, !!route.data[CACHE_PAGE])) {
            return true;
        }
        this.cache.delete(key);
        return false;
    }

    shouldAttach(route: ActivatedRouteSnapshot): boolean {
        const key = this.getKey(route);
        this.currentRouteKey = key;
        const cachedHandle = this.cache.get(key) as DetachedRouteHandle;
        if (cachedHandle && this.isCacheEnabled(route, !!(cachedHandle[CACHE_PAGE]))) {
            return true;
        }
        this.cache.delete(key);
        return false;
    }

    store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
        if (handle) {
            const key = this.getKey(route);
            handle[CACHE_PAGE] = !!route.data[CACHE_PAGE];
            this.cache.set(key, handle);
        }
    }

    retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
        const key = this.getKey(route);
        return this.cache.get(key);
    }

    reset(pageName?: string) {
        if (pageName) {
            this.cache.delete(pageName);
            const pageWithParams = pageName += '?';
            const entriesToDelete = [];
            for(let k of this.cache.keys()) {
                if (k.startsWith(pageWithParams)) {
                    entriesToDelete.push(k);
                }
            }
            entriesToDelete.forEach(k => this.cache.delete(k));
        } else {
            return this.cache.clear();
        }
    }
}
/* Custom Strategy specifically for preview & WaveMaker Deployments */
export class WmRouteReuseStrategy extends WmDefaultRouteReuseStrategy
    implements RouteReuseStrategy {
    constructor() {
        super();
    }
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
        return false;
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
    constructor() {
        super();
    }
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
            //No need to compare query params for layout routeConfig
            if(future.data.layoutName && current.data.layoutName)  {
                return  true;
            }
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
