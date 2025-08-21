import { AfterContentInit, ContentChildren, Directive, forwardRef, Inject, Injector, Optional, QueryList, ChangeDetectorRef } from '@angular/core';
import { DynamicComponentRefProvider, noop, StatePersistence } from '@wm/core';
import {
    APPLY_STYLES_TYPE,
    createArrayFrom,
    IWidgetConfig,
    provideAsWidgetRef,
    StylableComponent,
    styler
} from '@wm/components/base';

import { registerProps } from './accordion.props';
import { AccordionPaneComponent } from './accordion-pane/accordion-pane.component';
import { find, forEach, get, indexOf, isArray, isNumber } from "lodash-es";

const DEFAULT_CLS = 'app-accordion panel-group';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-accordion',
    hostClass: DEFAULT_CLS
};

@Directive({
    standalone: true,
    selector: 'div[wmAccordion]',
    exportAs: 'wmAccordion',
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
    public injector: Injector;

    private activePaneIndex: number;
    private activePane: AccordionPaneComponent;
    private promiseResolverFn: Function;
    private dynamicComponentProvider;
    private _dynamicContext;
    private dynamicPaneIndex;
    private dynamicPanes;
    public fieldDefs;

    @ContentChildren(forwardRef(() => AccordionPaneComponent)) panes: QueryList<AccordionPaneComponent>;

    constructor(
        inj: Injector,
        private cdr: ChangeDetectorRef,
        @Inject('EXPLICIT_CONTEXT') @Optional() explicitContext: any
    ) {
        super(inj, WIDGET_CONFIG, explicitContext);
        this.injector = inj;
    }

    /**
     * Expand a specific pane and notify widget manager
     */
    public expandPane(paneIndex: number, evt?: Event) {
        if (!this.isValidPaneIndex(paneIndex)) {
            console.warn(`Invalid pane index: ${paneIndex}`);
            return;
        }

        const pane = this.panes.toArray()[paneIndex];
        if (pane && !pane.isActive) {
            // Close other panes if closeothers is true
            if (this.closeothers) {
                this.closePanesExcept(pane);
            }
            
            // Expand the selected pane
            pane.expand();
            this.activePaneIndex = paneIndex;
            this.activePane = pane;
            
            // Force change detection after pane expansion
            setTimeout(() => {
                this.cdr.detectChanges();
            }, 50);
        }
    }

    /**
     * Collapse a specific pane and notify widget manager
     */
    public collapsePane(paneIndex: number, evt?: Event) {
        if (!this.isValidPaneIndex(paneIndex)) {
            return;
        }

        const pane = this.panes.toArray()[paneIndex];
        if (pane && pane.isActive) {
            pane.collapse(evt);
            this.activePaneIndex = -1;
            this.activePane = null;
        }
    }

    /**
     * Notify about pane changes (called by accordion panes)
     */
    notifyChange(pane: AccordionPaneComponent, isExpand: boolean, evt: Event) {
        // Handle pane state change notification
        if (isExpand) {
            // Pane was expanded
            this.invokeEventCallback('onPaneExpanded', { 
                accordion: this, 
                pane: pane,
                event: evt 
            });
        } else {
            // Pane was collapsed
            this.invokeEventCallback('onPaneCollapsed', { 
                accordion: this, 
                pane: pane,
                event: evt 
            });
        }
    }

    /**
     * Close all panes except the specified one
     */
    private closePanesExcept(exceptPane: AccordionPaneComponent) {
        this.panes.forEach(pane => {
            if (pane !== exceptPane && pane.isActive) {
                pane.collapse();
            }
        });
    }

    /**
     * This method is used to register the dynamic panes.
     * After all panes are initialzed, update the querylist manually based on index.
     * @param paneRef - refrence of the tabpane
     */
    public registerDynamicPane(paneRef) {
        this.dynamicPanes.push(paneRef);
        const isLastPane = this.dynamicPanes.length === this.dynamicPaneIndex;
        if (isLastPane) {
            for (let i = 0; i < this.dynamicPanes.length; i++) {
                const newPaneRef = find(this.dynamicPanes, pane => pane.dynamicPaneIndex === i);
                const isDuplicatePane = find(this.panes.toArray(), newPaneRef);
                if (!isDuplicatePane) {
                    this.panes.reset([...this.panes.toArray(), newPaneRef]);
                    if (newPaneRef.active) {
                        newPaneRef.expand();
                    }
                }
            }
        }
    }

    /**
     * This method is to add the tabpane dynamically
     * @param tabpanes - list of tabpanes
     */
    public addPane(tabpanes) {
        if (!isArray(tabpanes)) {
            tabpanes = [tabpanes];
        }
        const paneNamesList = [];
        forEach(tabpanes, (pane, index) => {
            const isPaneAlreadyCreated = find(this.panes.toArray(), { name: pane.name });
            const isPaneNameExist = indexOf(paneNamesList, pane.name);
            // If user tries to add tabpane with the same name which is already exists then do not create the pane
            if (isPaneAlreadyCreated || isPaneNameExist > 0) {
                console.warn(`The tab pane with name ${pane.name} already exists`);
                return;
            }

            let paramMarkup = '';
            let propsTmpl = '';
            this.dynamicPaneIndex++;
            const name = pane.name ? pane.name : `accordionpane${this.panes.toArray().length + (index + 1)}`;
            paneNamesList.push(name);
            const partialParams = get(pane, 'params');

            forEach(pane, (value, key) => {
                if (key !== 'params') {
                    propsTmpl = `${propsTmpl} ${key}="${value}"`;
                }
            });
            forEach(partialParams, (value, key) => {
                paramMarkup = `${paramMarkup} <wm-param name="${key}" value="${value}"></wm-param>`;
            });
            const markup = `<wm-accordionpane dynamicPaneIndex="${this.dynamicPaneIndex - 1}" isdynamic="true" name="${name}" ${propsTmpl}>
                            ${paramMarkup}
                        </wm-accordionpane>`;

            if (!this._dynamicContext) {
                this._dynamicContext = Object.create(this.viewParent);
                this._dynamicContext[this.getAttr('wmAccordian')] = this;
            }

            this.dynamicComponentProvider.addComponent(this.getNativeElement(), markup, this._dynamicContext, { inj: this.inj });
        });
        return paneNamesList;
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
        return find(this.panes.toArray(), { name: name });
    }

    /**
     * Get pane index by reference
     */
    getPaneIndexByRef(pane: AccordionPaneComponent): number {
        return this.panes.toArray().indexOf(pane);
    }

    private getPaneRefByIndex(index: number): AccordionPaneComponent {
        return this.panes.toArray()[index];
    }

    private onDataChange(newVal) {
        this.fieldDefs = createArrayFrom(newVal);
    }

    onPropertyChange(key: string, nv: any, ov?: any) {
        if (key === 'defaultpaneindex') {
            this.defaultpaneindex = nv;
        } else if (key === 'dataset') {
            this.onDataChange(nv);
        } else if (key === 'statehandler') {
            const widgetState = this.statePersistence.getWidgetState(this);
            let paneToSelect: any = [];
            if (nv !== 'none' && isArray(widgetState)) {
                widgetState.forEach(paneName => {
                    paneToSelect = this.panes.filter(function (pane) {
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
        } else if (key === 'tabindex') {
            return;
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }

    ngAfterContentInit() {
        super.ngAfterContentInit();
        this.promiseResolverFn();
        this.panes.changes.subscribe(slides => {
            if (this.panes.length) {
                this.expandPane(this.defaultpaneindex);
            }
        });
    }
}
