import { AfterContentInit, ContentChildren, Directive, Injector, QueryList } from '@angular/core';

import { DynamicComponentRefProvider, isNumber, noop } from '@wm/core';
import {StatePersistence} from '@wm/statepersistence';
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
    private dynamicComponentProvider;
    private _dynamicContext;
    private dynamicPaneIndex;
    private dynamicPanes;

    @ContentChildren(AccordionPaneComponent) panes: QueryList<AccordionPaneComponent>;

    constructor(inj: Injector, dynamicComponentProvider: DynamicComponentRefProvider) {
        let resolveFn: Function = noop;
        super(inj, WIDGET_CONFIG, new Promise(res => resolveFn = res));
        this.promiseResolverFn = resolveFn;
        this.statePersistence = this.inj.get(StatePersistence);
        this.dynamicComponentProvider = dynamicComponentProvider;
        this.dynamicPanes = [];
        this.dynamicPaneIndex = 0;
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
        const mode = this.statePersistence.computeMode(this.statehandler);
        if (evt &&  mode && mode.toLowerCase() !== 'none') {
            const activePanes = [];
            this.panes.forEach(function(pane) {
                if (pane.isActive) {
                    activePanes.push(pane.name);
                }
            });
            if (activePanes.length) {
                this.statePersistence.setWidgetState(this, activePanes);
            } else {
                this.statePersistence.removeWidgetState(this);
            }
        }
    }

    /**
     * This method is used to register the dynamic panes.
     * After all panes are initialzed, update the querylist manually based on index.
     * @param paneRef - refrence of the tabpane
     */
    public registerDynamicPane(paneRef) {
        this.dynamicPanes.push(paneRef);
        const isLastPane =  this.dynamicPanes.length === this.dynamicPaneIndex;
        if (isLastPane) {
            for (let i = 0; i < this.dynamicPanes.length; i++) {
                const newPaneRef  = _.find(this.dynamicPanes, pane => pane.dynamicPaneIndex === i);
                this.panes.reset([...this.panes.toArray(), newPaneRef]);
                if (newPaneRef.expandpane || this.defaultpaneindex === (this.panes.toArray().length - 1)) {
                    newPaneRef.expand();
                }
            }
        }
    }

    /**
     * This method is to add the tabpane dynamically
     * @param paneName - name of the tabpane
     * @param properties - properties of the tabpane
     */
   public addPane(paneName, properties?) {
       let paramMarkup = '';
       let propsTmpl = '';
       this.dynamicPaneIndex++;
       const name = paneName ? paneName : `accordionpane${this.panes.toArray().length + this.dynamicPaneIndex}`;
       const partialParams = _.get(properties, 'params');

       _.forEach(properties, (value, key) => {
           if (key !== 'params') {
               propsTmpl = `${propsTmpl} ${key}="${value}"`;
           }
       });
       _.forEach(partialParams, (value, key) => {
           paramMarkup = `${paramMarkup} <wm-param name="${key}" value="${value}"></wm-param>`;
       });
       const markup = `<wm-accordionpane dynamicPaneIndex="${this.dynamicPaneIndex - 1}" isdynamic="true" name="${name}" ${propsTmpl}>
                            ${paramMarkup}
                        </wm-accordionpane>`;

       if (!this._dynamicContext) {
           this._dynamicContext = Object.create(this.viewParent);
           this._dynamicContext[this.getAttr('wmAccordian')] = this;
       }

        this.dynamicComponentProvider.addComponent(this.getNativeElement(), markup, this._dynamicContext, {inj: this.inj});
    }

    /**
     * This method is to remove the tabpane
     * @param paneName - name of the pane
     */
    public removePane(paneName) {
        const paneRef = this.getPaneRefByName(paneName);
        if (paneRef) {
           paneRef.remove();
        }
    }

    private isValidPaneIndex(index: number): boolean {
        return (index >= 0 && index < this.panes.length);
    }

    private getPaneRefByName(name: string): AccordionPaneComponent {
        return _.find(this.panes.toArray(), {name: name});
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
            let paneToSelect: any = [];
            if (nv !== 'none' && _.isArray(widgetState)) {
                widgetState.forEach(paneName => {
                    paneToSelect = this.panes.filter(function(pane) {
                        return paneName === pane.name;
                    });
                    if (!paneToSelect.length) {
                        console.warn('Accordion pane name ' + paneName + ' in State is incorrect.');
                    } else {
                        this.expandPane(this.getPaneIndexByRef(paneToSelect[0]));
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
