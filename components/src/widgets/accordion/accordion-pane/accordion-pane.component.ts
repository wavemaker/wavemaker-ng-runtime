import { Component, ContentChildren, EventEmitter, forwardRef, Inject, Injector, OnInit, Output } from '@angular/core';

import { $appDigest, removeAttr } from '@wm/utils';

import { APPLY_STYLES_TYPE, styler } from '../../base/framework/styler';
import { IStylableComponent } from '../../base/framework/types';
import { BaseComponent } from '../../base/base.component';
import { RedrawableDirective } from '../../redraw/redrawable.directive';
import { registerProps } from './accordion-pane.props';
import { AccordionDirective } from '../accordion.component';
import { invokeEventHandler } from '../../../utils/widget-utils';

registerProps();

declare const _;

const DEFAULT_CLS = 'app-accordion-panel panel';
const WIDGET_CONFIG = {widgetType: 'wm-accordionpane', hostClass: DEFAULT_CLS};


@Component({
    selector: 'div[wmAccordionPane]',
    templateUrl: './accordion-pane.component.html',
    providers: [
        {provide: '@Widget', useExisting: forwardRef(() => AccordionPaneComponent)}
    ]
})
export class AccordionPaneComponent extends BaseComponent implements OnInit {
    isActive: boolean = false;
    paneId;
    $lazyload: Function = _.noop;

    @Output() collapse = new EventEmitter();
    @Output() expand = new EventEmitter();

    @ContentChildren(RedrawableDirective, {descendants: true}) redrawableComponents;

    togglePane($event) {
        if (this.isActive) {
            invokeEventHandler(this, 'collapse', {$event});
        } else {
            /*TODO: Write method to execute all redraw methods for widgets inside the accordion*/
            if ($event) {
                invokeEventHandler(this.parentAccordion, 'change', {$event, newPaneIndex: this.paneId, oldPaneIndex: (this.parentAccordion.activePane && this.parentAccordion.activePane.paneId) || 0});
            }
            this.parentAccordion.activePane = this;
            invokeEventHandler(this, 'expand', {$event});
            this.parentAccordion.closeOthers();
            this.$lazyload();
            setTimeout(() => {
                if (this.redrawableComponents) {
                    this.redrawableComponents.forEach(c => c.redraw());
                }
            }, 100);
        }

        this.isActive = !this.isActive;
        $appDigest();
    }

    get toggleIconClass() {
        if (this.isActive) {
            return this.parentAccordion && this.parentAccordion.expandicon;
        }
        return this.parentAccordion && this.parentAccordion.collapseicon;
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

    onPropertyChange(key, nv, ov) {
        switch (key) {
            case 'content':
                if (this.isActive) {
                    setTimeout(() => {
                        this.$lazyload();
                    }, 100);
                }
                break;
        }
    }

    constructor(inj: Injector, @Inject('@AccordionParent') private parentAccordion: AccordionDirective) {
        super(inj, WIDGET_CONFIG);

        styler(this.$element, this as IStylableComponent, APPLY_STYLES_TYPE.SHELL);
        styler(<HTMLElement>this.$element.querySelector('.panel-body'), this as IStylableComponent, APPLY_STYLES_TYPE.INNER_SHELL);

        removeAttr(this.$element, 'title');
    }

    ngOnInit() {
      super.ngOnInit();
      this.parentAccordion.register(this);
    }
}
