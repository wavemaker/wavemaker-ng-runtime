import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

import { isIos, isMobileApp, ScriptLoaderService } from '@wm/core';


@Injectable()
export class LazyLoadScriptsResolve implements Resolve<any> {

    constructor(private scriptLoaderService: ScriptLoaderService) {}

    async resolve() {
        const scriptsToLoad = [];
        if(isMobileApp()) {
            scriptsToLoad.push('node_modules-hammerjs-hammer.min.js');
        }
        if (isIos()) {
            scriptsToLoad.push('node_modules-iscroll-build-iscroll.js');
        }
        if (scriptsToLoad.length > 0) {
            await this.scriptLoaderService.load(...scriptsToLoad);
        }
    }
}
