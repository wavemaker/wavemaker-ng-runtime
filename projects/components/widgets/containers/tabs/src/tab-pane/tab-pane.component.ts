import {
    AfterViewInit,
    Attribute,
    Component,
    ContentChildren,
    HostBinding, inject, Inject,
    Injector,
    OnInit,
    Optional
} from '@angular/core';

import {noop, removeAttr} from '@wm/core';

import { APPLY_STYLES_TYPE, IWidgetConfig, provideAsWidgetRef, RedrawableDirective, styler, StylableComponent } from '@wm/components/base';
import { registerProps } from './tab-pane.props';
import { TabsComponent } from '../tabs.component';

const DEFAULT_CLS = 'tab-pane';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-tabpane',
    hostClass: DEFAULT_CLS
};

@Component({
    standalone: true, 
    selector: 'div[wmTabPane]',
    templateUrl: './tab-pane.component.html',
    providers: [
        provideAsWidgetRef(TabPaneComponent)
    ]
})
export class TabPaneComponent extends StylableComponent implements OnInit, AfterViewInit {
    static initializeProps = registerProps();

    private _isFirstLoad: boolean = true;
    private _isOnLoadTriggered: boolean = false;
    public $lazyLoad = noop;
    public name: string;
    public show: boolean;
    public smoothscroll: any;
    private isdynamic: boolean;
    public content: string;

    @HostBinding('class.active') isActive = false;
    @HostBinding('class.disabled') disabled = false;

    // reference to the components which needs a redraw(eg, grid, chart) when the height of this component changes
    @ContentChildren(RedrawableDirective, {descendants: true}) reDrawableComponents;

    private tabsRef = inject(TabsComponent);
    constructor(
        inj: Injector,
        @Attribute('heading') public heading,
        @Attribute('title') public title,
        @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any
    ) {
        super(inj, WIDGET_CONFIG, explicitContext);

        // title property here serves the purpose of heading.
        // TODO: make it common for all the widget.
        removeAttr(this.nativeElement, 'title');
    }

    // parent tabs component will call this method for the order of callbacks to be proper
    // order of callbacks - deselect, select, change
    public invokeOnSelectCallback($event?: Event) {
        this.invokeEventCallback('select', {$event});
    }

    public select($event?: Event, isKeyBoardEvent?: boolean) {
        // When called programatically $event won't be available
        if (this.isActive || this.disabled) {
            return;
        }

        this.isActive = true;
        this.$lazyLoad();
        this.redrawChildren();
        this.notifyParent($event, isKeyBoardEvent);
    }

    tabpaneHeaderClick($event, paneIndex) {
        this.invokeEventCallback('headerclick', {$event, paneIndex});
    }

    public deselect() {
        if (this.isActive) {
            this.isActive = false;
            this.invokeEventCallback('deselect');
        }
    }

    public remove() {
        if (this.isActive) {
            this === this.tabsRef.panes.last ? this.tabsRef.prev() : this.tabsRef.next();
        }
        const availablePanes = this.tabsRef.panes.toArray();
        availablePanes.splice((this as any).tabsRef.getPaneIndexByRef(this), 1);
        this.tabsRef.panes.reset([...availablePanes]);
        this.nativeElement.remove();
        this.tabsRef.$element.find(`.tab-header[data-paneid='${this.$element.attr('widget-id')}'] a`).remove();
    }

    private redrawChildren() {
        setTimeout(() => {
            if (this.reDrawableComponents) {
                this.reDrawableComponents.forEach(c => c.redraw());
            }
            // Fix for [WMS-24564]: trigger  Onload event when it is inline content
            if (!this._isOnLoadTriggered && !this.content) {
                this.invokeEventCallback('load');
                this._isOnLoadTriggered = true;
            }
        }, 100);
    }

    private notifyParent(evt?: Event, isKeyBoardEvent?: boolean) {
        this.tabsRef.notifyChange(this, evt, isKeyBoardEvent);
    }

    // select next valid tab
    private handleSwipeLeft() {
        this.tabsRef.next();
    }

    // select prev valid tab
    private handleSwipeRight() {
        this.tabsRef.prev();
    }

    // select event is called manually
    protected handleEvent(node: HTMLElement, eventName: string, callback: Function, locals: any) {
        if (eventName !== 'select') {
            super.handleEvent(this.nativeElement, eventName, callback, locals);
        }
    }

    onPropertyChange(key: string, nv: any, ov?: any) {
        if (key === 'content') {
            if (this.isActive) {
                setTimeout(() => this.$lazyLoad(), 100);
            }
        } else if (key === 'show') {
            // overridding the base component show propertyChangeHandler
            this.nativeElement.hidden = !nv;
            // setting default tab pane on pageload whenever show property is bindable
            if (this._isFirstLoad) {
                (this as any).tabsRef.selectDefaultPaneByIndex((this as any).tabsRef.defaultpaneindex);
            } else if (!nv && this.isActive) {
                (this as any).tabsRef.next();
            } else if (nv || !this.isActive) {
                (this as any).tabsRef.tabsAnimator?.transitionTabIntoView();
            }
            this._isFirstLoad = false;
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }

    ngOnInit() {
        super.ngOnInit();
        this.title = this.title || this.heading;
    }

    ngAfterViewInit() {
        styler(
            this.nativeElement.querySelector('.tab-body') as HTMLElement,
            this,
            APPLY_STYLES_TYPE.CONTAINER
        );
        super.ngAfterViewInit();
        if (this.isdynamic) {
            this.tabsRef.registerDynamicTab(this);
        }
    }
}
