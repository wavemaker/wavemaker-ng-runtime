import { OnDestroy, ChangeDetectorRef } from '@angular/core';
import { debounce } from '@utils/utils';

export abstract class BaseComponent implements OnDestroy {
    $element: HTMLElement;
    $host: HTMLElement;
    widgetType: string;
    widgetId: string;
    $digest;

    destroyListeners;

    constructor($host: HTMLElement, $el: HTMLElement, cdr: ChangeDetectorRef) {
        this.$host = $host;
        this.$element = $el;
        this.$digest = debounce(cdr.detectChanges.bind(cdr));
    }

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
