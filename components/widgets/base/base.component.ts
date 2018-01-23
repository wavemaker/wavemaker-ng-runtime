import { OnDestroy } from '@angular/core';

export abstract class BaseComponent implements OnDestroy {
    $element: HTMLElement;
    $host: HTMLElement;
    widgetType: string;
    widgetId: string;
    $digest;

    destroyListeners;

    onPropertyChange(k, nv, ov) {
    }

    onStyleChange(k, nv, ov) {
    }

    addDestroyListener(fn) {
        this.destroyListeners.push(fn);
    }

    ngOnDestroy() {
        this.destroyListeners.forEach(fn => fn());
    }
}
