import { AfterContentInit, ContentChildren, Directive, Injector, QueryList } from '@angular/core';

import { DynamicComponentRefProvider, extendProto, isNumber, noop } from '@wm/core';
import { APPLY_STYLES_TYPE, IWidgetConfig, provideAsWidgetRef, StylableComponent, styler } from '@wm/components/base';

import { registerProps } from './accordion.props';
import { AccordionPaneComponent } from './accordion-pane/accordion-pane.component';

const DEFAULT_CLS = 'app-accordion panel-group';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-accordion',
    hostClass: DEFAULT_CLS
};
declare const _;

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
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.SCROLLABLE_CONTAINER);
        this.dynamicComponentProvider = dynamicComponentProvider;
        this.dynamicPanes = [];
        this.dynamicPaneIndex = 0;
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
    }

    public registerDynamicPane(paneRef) {
        this.dynamicPanes.push(paneRef);
        const isLastPane =  this.dynamicPanes.length === this.dynamicPaneIndex;
        if (isLastPane) {
            for (let i = 0; i < this.dynamicPanes.length; i++) {
                const paneRef1  = _.find(this.dynamicPanes, pane => pane.dynamicPaneIndex === i);
                (this as any).panes._results.push(paneRef1);
                if (paneRef1.expandpane || this.defaultpaneindex === (this.panes.toArray().length - 1)) {
                    paneRef1.expand();
                }
            }
        }
    }

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
            if (this.isValidPaneIndex(nv)) {
                this.expandPane(nv);
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
