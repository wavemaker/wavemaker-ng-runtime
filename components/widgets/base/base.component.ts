import { OnDestroy, ChangeDetectorRef, ElementRef, OnInit } from '@angular/core';
import { debounce } from '@utils/utils';
import { initWidget } from '../../utils/init-widget';

export class BaseComponent implements OnDestroy, OnInit {
    $element: HTMLElement;
    $host: HTMLElement;
    widgetType: string;
    widgetId: string;
    $digest;
    init;
    destroyListeners;

    _ngOnInit() {}

    constructor ({widgetType, hasTemplate}, inj: any, $host: ElementRef, cdr: ChangeDetectorRef) {
        this.$host = $host.nativeElement;
        this.widgetType = widgetType;
        this.$digest = debounce(cdr.detectChanges.bind(cdr));
        this.init = initWidget(this, (<any>inj).elDef, (<any>inj).view);

        if (!hasTemplate) {
            this.$element = this.$host;
        }
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

    ngOnInit() {
        if (!this.$element) {
            this.$element = <HTMLElement>this.$host.children[0];
        }
        this.init();
        this._ngOnInit();
    }
}
