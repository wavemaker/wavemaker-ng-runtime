import { OnDestroy, ChangeDetectorRef, ElementRef, OnInit } from '@angular/core';
import { debounce } from '@utils/utils';
import { initWidget } from '../../utils/init-widget';
import { Subject } from 'rxjs/Subject';
import { addClass } from '@utils/dom';

const noop = () => {};

export class BaseComponent implements OnDestroy, OnInit {
    $element: HTMLElement;
    widgetType: string;
    widget: any;
    widgetId: string;
    $digest;
    init = noop;

    styleChange = new Subject();
    styleChange$ = this.styleChange.asObservable();

    propertyChange = new Subject();
    propertyChange$ = this.propertyChange.asObservable();

    destroy = new Subject();
    destroy$ = this.destroy.asObservable();

    eventHandlers = new Map<string, Function>();

    // TODO: Implement touch events for the mobile
    _hostEvents = new Set(['click', 'dblclick', 'mouseenter', 'mouseleave', 'mouseout', 'mouseover', 'focus', 'blur', 'keydown', 'keypress', 'keyup']);

    preInit({widgetType, hostClass}, inj: any, $host: ElementRef, cdr: ChangeDetectorRef) {
        this.$element = $host.nativeElement;
        this.widgetType = widgetType;
        this.$digest = debounce(cdr.detectChanges.bind(cdr));

        if (hostClass) {
            addClass(this.$element, hostClass);
        }

        this.init = initWidget(this, (<any>inj).elDef, (<any>inj).view);

        this.propertyChange$.subscribe(({key, nv, ov}) => this.onPropertyChange(key, nv, ov));
        this.styleChange$.subscribe(({key, nv, ov}) => this.onStyleChange(key, nv, ov));
    }

    constructor (widgetConfig: {widgetType, hostClass}, inj: any, $host: ElementRef, cdr: ChangeDetectorRef, propsReady?: Promise<void>) {
        if (propsReady) {
            propsReady.then(() => {
                this.preInit(widgetConfig, inj, $host, cdr);
                this.init();
            });
        } else {
            this.preInit(widgetConfig, inj, $host, cdr);
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
        this.init();
    }
}
