import { AfterContentInit, ContentChildren, Directive, Injector, QueryList } from '@angular/core';

import { isNumber, noop, StatePersistence } from '@wm/core';
import { APPLY_STYLES_TYPE, IWidgetConfig, provideAsWidgetRef, StylableComponent, styler } from '@wm/components/base';

import { registerProps } from './accordion.props';
import { AccordionPaneComponent } from './accordion-pane/accordion-pane.component';

declare const _;

const DEFAULT_CLS = 'app-accordion panel-group';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-accordion',
    hostClass: DEFAULT_CLS
};

@Directive({
    selector: 'div[wmAccordion]',
    providers: [
        provideAsWidgetRef(AccordionDirective)
    ]
})
export class AccordionDirective extends StylableComponent implements AfterContentInit {
    static initializeProps = registerProps();

    public defaultpaneindex: number;
    public closeothers: boolean;
    public statehandler: any;
    private statePersistence: StatePersistence;

    private activePaneIndex: number;
    private activePane: AccordionPaneComponent;
    private promiseResolverFn: Function;

    @ContentChildren(AccordionPaneComponent) panes: QueryList<AccordionPaneComponent>;

    constructor(inj: Injector, statePersistence: StatePersistence) {
        let resolveFn: Function = noop;
        super(inj, WIDGET_CONFIG, new Promise(res => resolveFn = res));
        this.promiseResolverFn = resolveFn;
        this.statePersistence = statePersistence;
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.SCROLLABLE_CONTAINER);
    }

    /**
     * AccordionPane children components invoke this method to communicate with the parent
     * if isExpand is true and when closeothers is true, all the other panes are collapsed
     * if the evt argument is defined on-change callback will be invoked.
     * updates the activePane index property
     * @param {AccordionPaneComponent} paneRef
     * @param {boolean} isExpand
     * @param {Event} evt
     */
    public notifyChange(paneRef: AccordionPaneComponent, isExpand: boolean, evt: Event) {
        if (isExpand) {
            this.closePanesExcept(paneRef);
            const index = this.getPaneIndexByRef(paneRef);
            this.activePane = paneRef.getWidget();
            // if the event is defined invoke the change callback.
            // programmatic invocations of expand/collapse on accordion-pane will not trigger change event
            if (evt) {
                this.invokeEventCallback('change', {
                    $event: evt,
                    newPaneIndex: index,
                    oldPaneIndex: this.activePaneIndex
                });
            }
            this.activePaneIndex = index;
        }
        if (evt && this.statehandler !== 'none') {
            const activePanes = [];
            this.panes.forEach(function(pane, paneIndex) {
                if (pane.isActive) {
                    activePanes.push(paneIndex);
                }
            });
            if (activePanes.length) {
                this.statePersistence.setWidgetState(this, activePanes);
            } else {
                this.statePersistence.removeWidgetState(this);
            }
        }
    }

    private isValidPaneIndex(index: number): boolean {
        return (index >= 0 && index < this.panes.length);
    }

    private getPaneIndexByRef(paneRef: AccordionPaneComponent): number {
        return this.panes.toArray().indexOf(paneRef);
    }

    private getPaneRefByIndex(index: number): AccordionPaneComponent {
        return this.panes.toArray()[index];
    }

    // Except the pane provided close all other panes
    private closePanesExcept(paneRef: AccordionPaneComponent | number) {
        if (isNumber(paneRef)) {
            paneRef = this.getPaneRefByIndex(paneRef as number);
        }
        if (this.closeothers) {
            this.panes.forEach(pane => {
                if (pane !== paneRef) {
                    pane.collapse();
                }
            });
        }
    }

    private expandPane(index: number) {
        this.closePanesExcept(index);
        this.panes.toArray()[index].expand();
    }

    onPropertyChange(key: string, nv: any, ov?: any) {
        if (key === 'defaultpaneindex') {
            this.defaultpaneindex = nv;
        } else if (key === 'statehandler') {
            const widgetState = this.statePersistence.getWidgetState(this);
            if (nv !== 'none' && _.isArray(widgetState)) {
                widgetState.forEach(paneIndex => {
                    if (!_.isInteger(paneIndex) || this.panes.length - paneIndex <= 0) {
                        console.warn('Accordion pane index ' + paneIndex + ' in State is incorrect.');
                    } else {
                        this.expandPane(paneIndex);
                    }
                });
            } else {
                if (this.isValidPaneIndex(this.defaultpaneindex)) {
                    this.expandPane(this.defaultpaneindex);
                }
            }
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }

    ngAfterContentInit() {
        super.ngAfterContentInit();
        this.promiseResolverFn();
    }
}
