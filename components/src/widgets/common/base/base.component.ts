import { AfterContentInit, AfterViewInit, ElementRef, Injector, OnDestroy, OnInit } from '@angular/core';
import { EventManager } from '@angular/platform-browser';

import { Subject } from 'rxjs/Subject';

import { $parseEvent, $unwatch, $watch, addClass, isDefined, setAttr } from '@wm/core';

import { getWidgetPropsByType } from '../../framework/widget-props';
import { register } from '../../framework/widget-registry';
import { proxyHandler } from '../../framework/property-change-handler';
import { ChangeListener, IWidgetConfig } from '../../framework/types';
import { widgetIdGenerator } from '../../framework/widget-id-generator';
import { DISPLAY_TYPE, EVENTS_MAP } from '../../framework/constants';
import { ProxyProvider } from '../../framework/proxy-provider';
import { getWatchIdentifier } from '../../../utils/widget-utils';

declare const $;

export abstract class BaseComponent implements OnDestroy, OnInit, AfterViewInit, AfterContentInit {

    /**
     * unique identifier for the widget
     */
    public readonly widgetId: any;

    /**
     * jQuery nativeElement reference of the component root
     */
    public get $element() {
        return $(this.nativeElement);
    }

    /**
     * DOM node reference of the component root
     */
    protected readonly nativeElement: HTMLElement;

    /**
     * Type of the component
     */
    protected readonly widgetType: string;

    /**
     * Most of the cases it is same as widgetType
     * for specific widgets like charts widgetType can be wm-chart where as the subtype can be wm-bar-chart
     */
    protected readonly widgetSubType: string;

    /**
     * Proxy for the component instance.
     */
    protected readonly widget: any;

    /**
     * View parent component
     * eg, Page, Partial, Prefab
     */
    protected readonly pageComponent: any;

    /**
     * Style change subject and observable
     */
    private readonly styleChange = new Subject();

    /**
     * Property change subject and observable
     */
    private readonly propertyChange = new Subject();

    /**
     * Component destroy subject and observable
     */
    private readonly destroy = new Subject();

    /**
     * Map of event handler callbacks
     */
    private eventHandlers = new Map<string, {callback: Function, locals: any}>();

    /**
     * context of the widget
     * when the widget is preset inside a repeater this context will have the repeater related properties
     */
    private context: any;

    /**
     * Initial state of the widget.
     * Will be undefined once the initial properties are set on to the component
     */
    private initState: Map<string, any>;

    /**
     * Internal flag to determine whether to wait for the widget initialization or not
     * If the initPromise is provided in the construction wait till the promise is resolved
     * If the initPromise is not provided proceed with the initialization, which is the default behavior.
     */
    private readonly delayedInit: boolean;

    /**
     * Display type of the component. eg, block(Default), inline-block, inline etc
     */
    private displayType: string;

    /**
     * EventManger to add/remove events
     */
    protected readonly eventManager: EventManager;

    /**
     * Holds the event registration functions.
     * these functions needs to be executed after onViewInit
     */
    private toBeSetupEventsQueue: Array<Function> = [];

    protected constructor(
        protected inj: Injector,
        config: IWidgetConfig,
        initPromise?: Promise<any> // Promise on which the initialization has to wait
    ) {
        const elementRef = inj.get(ElementRef);
        this.nativeElement = elementRef.nativeElement;
        this.widgetType = config.widgetType;
        this.widgetSubType = config.widgetSubType || config.widgetType;
        this.pageComponent = (inj as any).view.component;
        this.displayType = config.displayType || DISPLAY_TYPE.BLOCK;
        this.context = (inj as any).view.context;
        this.widget = ProxyProvider.create(this, proxyHandler);
        this.eventManager = inj.get(EventManager);

        if (config.hostClass) {
            addClass(this.nativeElement, config.hostClass);
        }

        this.widgetId = this.generateWidgetId();
        setAttr(this.nativeElement, 'widget-id', this.widgetId);

        // register default property change handler and style change handler
        this.registerStyleChangeListener(this.onStyleChange, this);
        this.registerPropertyChangeListener(this.onPropertyChange, this);

        // if the initPromise is provided, wait till the promise is resolved to proceed with the widget initialization
        if (!initPromise) {
            this.initWidget();
        } else {
            this.delayedInit = true;
            initPromise.then(() => {
                this.initWidget();
                this.setInitProps();
            });
        }
    }

    public getNativeElement(): HTMLElement {
        return this.nativeElement;
    }

    public getWidgetType(): string {
        return this.widgetType;
    }

    public getWidgetSubType(): string {
        return this.widgetSubType;
    }

    public getWidget(): any {
        return this.widget;
    }

    public notifyStyleChange(key: string, nv: any, ov: any) {
        this.styleChange.next({key, nv, ov});
    }

    public notifyPropertyChange(key: string, nv: any, ov: any) {
        this.propertyChange.next({key, nv, ov});
    }

    public registerStyleChangeListener(fn: ChangeListener, ctx?: any) {
        if (ctx) {
            fn = fn.bind(ctx);
        }
        this.styleChange.subscribe(({key, nv, ov}) => fn(key, nv, ov));
    }

    public registerPropertyChangeListener(fn: ChangeListener, ctx?: any) {
        if (ctx) {
            fn = fn.bind(ctx);
        }
        this.propertyChange.subscribe(({key, nv, ov}) => fn(key, nv, ov));
    }

    public registerDestroyListener(fn: Function, ctx?: any) {
        if (ctx) {
            fn = fn.bind(ctx);
        }
        this.destroy.subscribe(() => fn);
    }

    public getDisplayType(): string {
        return this.displayType;
    }

    /**
     * set the value on the proxy object ie, widget
     * setting the property on the proxy will invoke the change listeners
     * @param {string} key
     * @param value
     */
    public setWidgetProperty(key: string, value: any) {
        this.widget[key] = value;
    }

    /**
     * Generates a unique id
     * Default pattern is `widget-id-${id}`
     * Components can override this method to generate a different id eg, bar-chart-1
     */
    protected generateWidgetId(): string {
        return widgetIdGenerator.nextUid();
    }

    /**
     * Default property change handler
     */
    protected onPropertyChange(key: string, nv: any, ov: any) {}

    /**
     * Default style change handler
     */
    protected onStyleChange(k: string, nv: any, ov: any) {}

    /**
     * Register the widget with the widgetRegistry
     */
    protected registerWidget(widgetName: string) {
        this.registerDestroyListener(register(this.widget, this.pageComponent, this.widgetId, widgetName));
    }

    /**
     * override the
     */
    protected getMappedEventName(eventName) {
        return EVENTS_MAP.get(eventName) || eventName;
    }

    /**
     * invoke the event handler
     * Components can override this method to execute custom logic before invoking the user callback
     */
    protected handleEvent(node: HTMLElement, eventName: string, eventCallback: Function, locals: any) {
        this.eventManager.addEventListener(
            node,
            eventName,
            e => {
                locals.$event = e;
                eventCallback();
            }
        );
    }

    /**
     * parse the event expression and save reference to the function inside eventHandlers map
     * If the component provides a override for an event through @Event decorator invoke that
     * else invoke the resolved function
     *
     * @param {string} eventName
     * @param {string} expr
     */
    protected processEventAttr(eventName: string, expr: string) {
        let fn = $parseEvent(expr);
        const locals = {widget: this.widget, $event: undefined};

        fn = fn.bind(undefined, this.pageComponent, locals);

        this.eventHandlers.set(eventName, {callback: fn, locals});

        // events needs to be setup after viewInit
        this.toBeSetupEventsQueue.push(() => {
            this.handleEvent(this.nativeElement, this.getMappedEventName(eventName), fn, locals);
        });
    }

    /**
     * Process the bound property
     * Register a watch on the bound expression
     */
    protected processBindAttr(propName: string, expr: string) {
        this.initState.delete(propName);
        this.registerDestroyListener(
            $watch(
                expr,
                this.pageComponent,
                this.context,
                nv => this.widget[propName] = nv,
                getWatchIdentifier(this.widgetId, propName)
            )
        );
    }

    /**
     * Remove watch on the bound property
     */
    protected removePropertyBinding(propName: string) {
        $unwatch(getWatchIdentifier(this.widgetId, propName));
    }

    /**
     * invoke the event callback method
     * @param {string} eventName
     * @param extraLocals
     */
    public invokeEventCallback(eventName: string, extraLocals?: any) {
        const callbackInfo = this.eventHandlers.get(eventName);
        if (callbackInfo) {
            const fn = callbackInfo.callback;
            const locals = callbackInfo.locals || {};

            if (fn) {
                return fn(Object.assign(locals, extraLocals));
            }
        }
    }

    /**
     * Process the attribute
     * If the attribute is an event expression, generate a functional representation of the expression
     *      and keep in eventHandlers
     * If the attribute is a bound expression, register a watch on the expression
     */
    protected processAttr(attrName: string, attrValue: string) {
        const {0: propName, 1: meta, length} = attrName.split('.');
        if (meta === 'bind') {
            this.processBindAttr(propName, attrValue);
        } else if (meta === 'event') {
            this.processEventAttr(propName, attrValue);
        } else if (length === 1) {
            this.initState.set(propName, attrValue);
        } else {
            // custom attributes provided on elDef;
        }
    }

    /**
     * Process the attributes
     */
    private processAttrs() {
        const elDef = (this.inj as any).elDef;

        for (const [, attrName, attrValue] of elDef.element.attrs) {
            this.processAttr(attrName, attrValue);
        }
    }

    /**
     * Update the initState with the default property values and the values provided in the markup
     * Process the attributes
     * Register the widget
     */
    protected initWidget() {
        const context = (this.inj as any).view.context;

        // assign the context property accordingly
        if (this.pageComponent !== context) {
            this.context = context;
        } else {
            this.context = {};
        }

        this.initState = new Map<string, any>();

        // get the widget properties
        const widgetProps: Map<string, any> = getWidgetPropsByType(this.widgetSubType);
        widgetProps.forEach((v, k) => {
            if (isDefined(v.value)) {
                this.initState.set(k, v.value);
            }
        });

        this.processAttrs();

        this.registerWidget(this.initState.get('name'));
    }

    /**
     * Update the default properties and the properties provided in the markup in component
     * Invoking this method will result in invocation of propertyChange handlers on the component for the first time
     */
    protected setInitProps() {
        this.widget.name = this.initState.get('name');
        this.initState.forEach((v, k) => {
            if (k !== 'name') {
                this.widget[k] = v;
            }
        });
        this.initState.clear();
        this.initState = undefined;
    }

    /**
     * Returns true, if a listener registered for the given event on this widget markup.
     * @param eventName
     * @returns {boolean}
     */
    protected hasEventCallback(eventName): boolean {
        return this.eventHandlers.has(eventName);
    }

    /**
     * nativeElement will be available by this time
     * if the delayInit is false, properties meta will be available by this time
     * Invoke the setInitProps if the delayInit is false
     */
    ngOnInit() {
        if (!this.delayedInit) {
            this.setInitProps();
        }
    }

    /**
     * Register the events
     */
    ngAfterViewInit() {
        if (this.toBeSetupEventsQueue.length) {
            for (const fn of this.toBeSetupEventsQueue) {
                fn();
            }
        }
        this.toBeSetupEventsQueue.length = 0;
    }

    ngAfterContentInit() {}

    ngOnDestroy() {
        this.styleChange.complete();
        this.propertyChange.complete();

        this.destroy.next();
        this.destroy.complete();
    }
}
