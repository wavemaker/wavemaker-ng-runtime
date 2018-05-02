import { AfterContentInit, Attribute, ContentChildren, Directive, forwardRef, Injector, QueryList } from '@angular/core';

import { isNumber } from '@wm/core';

import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { IWidgetConfig, WidgetRef } from '../../framework/types';
import { registerProps } from './accordion.props';
import { StylableComponent } from '../base/stylable.component';
import { AccordionPaneComponent } from './accordion-pane/accordion-pane.component';

registerProps();

const DEFAULT_CLS = 'app-accordion panel-group';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-accordion',
    hostClass: DEFAULT_CLS
};

@Directive({
    selector: 'div[wmAccordion]',
    providers: [
        {provide: WidgetRef, useExisting: forwardRef(() => AccordionDirective)}
    ]
})
export class AccordionDirective extends StylableComponent implements AfterContentInit {

    public defaultpaneindex: number;
    public closeothers: boolean;

    private activePaneIndex: number;

    @ContentChildren(AccordionPaneComponent) panes: QueryList<AccordionPaneComponent>;

    constructor(inj: Injector, @Attribute('defaultpaneindex.bind') private hasDefaultPaneIndexBinding: number) {
        super(inj, WIDGET_CONFIG);

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

    private isValidPaneIndex(index: number): boolean {
        return (index >= 0 && index < this.panes.length);
    }

    private getPaneIndexByRef(paneRef: AccordionPaneComponent): number {
        let index = 0;
        for (const pane of this.panes.toArray()) {
            if (pane === paneRef) {
                return index;
            }
            index++;
        }
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
        this.activePaneIndex = index;
    }

    private expandDefaultPane() {
        let paneIndex = this.defaultpaneindex || 0;
        if (!this.isValidPaneIndex(paneIndex)) {
            paneIndex = 0;
        }

        this.expandPane(paneIndex);
    }

    onPropertyChange(key: string, nv: any) {
        if (key === 'defaultpaneindex') {
            if (this.isValidPaneIndex(nv)) {
                this.expandPane(nv);
            }
        }
    }

    ngAfterContentInit() {
        // if the defaultPaneIndex is not bound, expand the pane otherwise wait till the binding is resolved
        if (!this.hasDefaultPaneIndexBinding) {
            this.expandDefaultPane();
        }
    }
}
