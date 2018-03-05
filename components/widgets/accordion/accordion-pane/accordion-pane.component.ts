import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Inject, Injector, OnInit, Output } from '@angular/core';
import { BaseComponent } from '../../base/base.component';
import { APPLY_STYLES_TYPE, styler } from '../../../utils/styler';
import { registerProps } from './accordion-pane.props';
import { removeAttr } from '@utils/dom';
import { $appDigest } from '@utils/watcher';
import { AccordionDirective } from '../accordion.component';

registerProps();

const DEFAULT_CLS = 'app-accordion-panel panel';
const WIDGET_CONFIG = {widgetType: 'wm-accordionpane', hostClass: DEFAULT_CLS};


@Component({
    selector: 'div[wmAccordionPane]',
    templateUrl: './accordion-pane.component.html'
})
export class AccordionPaneComponent extends BaseComponent implements AfterViewInit, OnInit {
    isActive;
    paneId;

    @Output() collapse = new EventEmitter();
    @Output() expand = new EventEmitter();

    togglePane($event) {
        if (this.isActive) {
            this.collapse.emit({$event});
        } else {
            /*TODO: Write method to execute all redraw methods for widgets inside the accordion*/
            if ($event) {
                this.parentAccordion.change.emit({$event, $scope: this.parentAccordion, newPaneIndex: this.paneId, oldPaneIndex: (this.parentAccordion.activePane && this.parentAccordion.activePane.paneId) || 0});
            }
            this.parentAccordion.activePane = this;
            this.expand.emit($event);
            this.parentAccordion.closeOthers();
        }

        this.isActive = !this.isActive;
        $appDigest();
    }

    expandPane($event) {
        if (!this.isActive) {
            this.togglePane($event);
        }
    }

    collapsePane($event) {
        if (this.isActive) {
            this.togglePane($event);
        }
    }

    constructor(inj: Injector, elRef: ElementRef, cdr: ChangeDetectorRef, @Inject('@AccordionParent') private parentAccordion: AccordionDirective) {
        super(WIDGET_CONFIG, inj, elRef, cdr);

        styler(this.$element, this, APPLY_STYLES_TYPE.SHELL);
        styler(<HTMLElement>this.$element.querySelector('.panel-body'), this, APPLY_STYLES_TYPE.INNER_SHELL);

        removeAttr(this.$element, 'title');
    }

    ngAfterViewInit() {
        this.parentAccordion.register(this);
    }

    ngOnInit() {
        super.ngOnInit();
    }
}
