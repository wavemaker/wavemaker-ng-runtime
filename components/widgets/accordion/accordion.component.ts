import { ChangeDetectorRef, Directive, ElementRef, EventEmitter, forwardRef, Injector, OnInit, Output } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { APPLY_STYLES_TYPE, styler } from '../../utils/styler';
import { registerProps } from './accordion.props';
import { $appDigest } from '@utils/watcher';

registerProps();

const DEFAULT_CLS = 'app-accordion panel-group';
const WIDGET_CONFIG = {widgetType: 'wm-accordion', hostClass: DEFAULT_CLS};

@Directive({
    selector: 'div[wmAccordion]',
    providers: [{provide: '@AccordionParent', useExisting: forwardRef(() => AccordionDirective)}]
})
export class AccordionDirective extends BaseComponent implements OnInit {
    panes: any = [];
    activePane: any;
    paneIndex = 0;
    closeothers;

    @Output() change = new EventEmitter();

    register(paneScope) {
        this.panes.push(paneScope);
        paneScope.paneId = this.paneIndex;
        this.paneIndex++;
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
                this.activePane.expandPane();
                break;
        }
    }

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef) {
        super(WIDGET_CONFIG, inj, elRef, cdr);

        styler(this.$element, this, APPLY_STYLES_TYPE.SCROLLABLE_CONTAINER);
    }

    ngOnInit() {
        super.ngOnInit();
    }
}
