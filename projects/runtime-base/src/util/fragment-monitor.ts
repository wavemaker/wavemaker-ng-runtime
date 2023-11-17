import { noop } from '@wm/core';

import { Subject } from 'rxjs';
import { Directive } from "@angular/core";

@Directive()
export abstract class FragmentMonitor {
    fragments = 0;
    viewInit$: Subject<any>;
    isViewInitialized: boolean;
    isPageComponent: boolean = true;

    fragmentsLoaded$ = new Subject();

    constructor() {}

    init() {
        // console.log(`inside fragmentMonitor: Page-${(this as any).pageName}, Partial-${(this as any).partialName}`);

        this.viewInit$.subscribe(noop, noop, () => {
            this.isViewInitialized = true;
            this.isReady();
        });
    }

    registerFragment() {
        this.fragments++;
    }

    resolveFragment() {
        this.fragments--;
        this.isReady();
    }

    isReady() {
        if (this.isViewInitialized && !this.fragments) {
            this.registerFragment = noop;
            this.resolveFragment = noop;
            this.fragmentsLoaded$.complete();
        }
    }
}
