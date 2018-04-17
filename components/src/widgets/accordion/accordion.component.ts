import { Directive, forwardRef, Injector } from '@angular/core';

import { $appDigest } from '@wm/utils';

import { APPLY_STYLES_TYPE, styler } from '../base/framework/styler';
import { IStylableComponent } from '../base/framework/types';
import { BaseComponent } from '../base/base.component';
import { registerProps } from './accordion.props';

registerProps();

const DEFAULT_CLS = 'app-accordion panel-group';
const WIDGET_CONFIG = {widgetType: 'wm-accordion', hostClass: DEFAULT_CLS};

@Directive({
    selector: 'div[wmAccordion]',
    providers: [{provide: '@AccordionParent', useExisting: forwardRef(() => AccordionDirective)}]
})
export class AccordionDirective extends BaseComponent {
    panes: any = [];
    activePane: any;
    paneIndex = 0;
    closeothers;
    expandicon;
    collapseicon;
    defaultpaneindex;

    register(paneScope) {
        this.panes.push(paneScope);
        paneScope.paneId = this.paneIndex;
        this.paneIndex++;
        if (paneScope.paneId === this.defaultpaneindex) {
            paneScope.expandPane(); // Todo - Nikhilesh
        }
    }

    closeOthers() {
        if (this.closeothers) {
            this.panes.forEach((pane) => {
                if (pane.isActive) {
                    pane.collapse.emit();
                }
                pane.isActive = false;
            });
            $appDigest();
        }
    }
    onPropertyChange(key, nv, ov?) {
        switch (key) {
            case 'defaultpaneindex':
                this.activePane = this.panes[nv || 0];
                if (this.activePane) {
                    this.activePane.expandPane(); // Todo - Nikhilesh
                }
                break;
        }
    }

    constructor(inj: Injector) {
        super(inj, WIDGET_CONFIG);

        styler(this.$element, this as IStylableComponent, APPLY_STYLES_TYPE.SCROLLABLE_CONTAINER);
    }
}
