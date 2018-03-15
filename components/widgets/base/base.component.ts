import { OnDestroy, ChangeDetectorRef, ElementRef, OnInit } from '@angular/core';
import { debounce } from '@utils/utils';
import { initWidget } from '../../utils/init-widget';
import { Subject } from 'rxjs/Subject';
import { addClass } from '@utils/dom';

export class BaseComponent implements OnDestroy, OnInit {
    $element: HTMLElement;
    widgetType: string;
    widget: any;
    widgetId: string;
    $digest;
    init;

    styleChange = new Subject();
    styleChange$ = this.styleChange.asObservable();

    propertyChange = new Subject();
    propertyChange$ = this.propertyChange.asObservable();

    destroy = new Subject();
    destroy$ = this.destroy.asObservable();

    eventHandlers = new Map<string, Function>();

    _hostEvents = new Set(['click', 'dblclick']);

    constructor ({widgetType, hostClass}, inj: any, $host: ElementRef, cdr: ChangeDetectorRef) {
        this.$element = $host.nativeElement;
        this.widgetType = widgetType;
        this.$digest = debounce(cdr.detectChanges.bind(cdr));

        if (hostClass) {
            addClass(this.$element, hostClass);
        }

        const parentContainer = inj.get('@namespace', undefined);

        this.init = initWidget(this, (<any>inj).elDef, (<any>inj).view, parentContainer);

        this.propertyChange$.subscribe(({key, nv, ov}) => this.onPropertyChange(key, nv, ov));
        this.styleChange$.subscribe(({key, nv, ov}) => this.onStyleChange(key, nv, ov));
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
        this.init();
    }
}
