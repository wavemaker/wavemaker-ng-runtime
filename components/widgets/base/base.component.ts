import { OnDestroy, ChangeDetectorRef, ElementRef, OnInit } from '@angular/core';
import { debounce } from '@utils/utils';
import { initWidget } from '../../utils/init-widget';
import { Subject } from 'rxjs/Subject';

export class BaseComponent implements OnDestroy, OnInit {
    $element: HTMLElement;
    $host: HTMLElement;
    widgetType: string;
    widgetId: string;
    $digest;
    init;

    styleChange = new Subject();
    styleChange$ = this.styleChange.asObservable();

    propertyChange = new Subject();
    propertyChange$ = this.propertyChange.asObservable();

    destroy = new Subject();
    destroy$ = this.destroy.asObservable();

    _ngOnInit() {}

    constructor ({widgetType, hasTemplate}, inj: any, $host: ElementRef, cdr: ChangeDetectorRef) {
        this.$host = $host.nativeElement;
        this.widgetType = widgetType;
        this.$digest = debounce(cdr.detectChanges.bind(cdr));

        const parentContainer = inj.get('@namespace', undefined);

        this.init = initWidget(this, (<any>inj).elDef, (<any>inj).view, parentContainer);

        this.propertyChange$.subscribe(({key, nv, ov}) => this.onPropertyChange(key, nv, ov));
        this.styleChange$.subscribe(({key, nv, ov}) => this.onStyleChange(key, nv, ov));

        if (!hasTemplate) {
            this.$element = this.$host;
        }
    }

    onPropertyChange(k, nv, ov) {
    }

    onStyleChange(k, nv, ov) {
    }

    ngOnDestroy() {
        this.destroy.next();
        this.propertyChange.complete();
        this.styleChange.complete();
        this.destroy.complete();
    }

    ngOnInit() {
        if (!this.$element) {
            this.$element = <HTMLElement>this.$host.children[0];
        }
        this.init();
        this._ngOnInit();
    }
}
