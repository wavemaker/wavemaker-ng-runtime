import { AfterViewInit, Component, ContentChildren, Injector } from '@angular/core';

import { noop, removeAttr } from '@wm/core';

import { APPLY_STYLES_TYPE, styler } from '../../../framework/styler';
import { IWidgetConfig } from '../../../framework/types';
import { registerProps } from './accordion-pane.props';
import { StylableComponent } from '../../base/stylable.component';
import { AccordionDirective } from '../accordion.directive';
import { RedrawableDirective } from '../../redraw/redrawable.directive';
import { provideAsWidgetRef } from '../../../../utils/widget-utils';

const DEFAULT_CLS = 'app-accordion-panel panel';
const WIDGET_CONFIG: IWidgetConfig = {widgetType: 'wm-accordionpane', hostClass: DEFAULT_CLS};

@Component({
    selector: 'div[wmAccordionPane]',
    templateUrl: './accordion-pane.component.html',
    providers: [
        provideAsWidgetRef(AccordionPaneComponent)
    ]
})
export class AccordionPaneComponent extends StylableComponent implements AfterViewInit {
    static initializeProps = registerProps();

    public isActive = false;
    public iconclass: string;
    public title: any;
    public subheading: string;
    public badgetype: any;
    public badgevalue: string;
    public smoothscroll: any;
    private $lazyLoad = noop;

    public name: string;

    // reference to the components which needs a redraw(eg, grid, chart) when the height of this component changes
    @ContentChildren(RedrawableDirective, {descendants: true}) reDrawableComponents;

    constructor(inj: Injector, private accordionRef: AccordionDirective) {
        super(inj, WIDGET_CONFIG);

        styler(this.nativeElement, this, APPLY_STYLES_TYPE.SHELL);

        // title property here serves the purpose of heading.
        // remove title property as attribute
        removeAttr(this.nativeElement, 'title');
    }

    /**
     * handles the pane expand
     * invoke $lazyLoad method which takes care of loading the partial when the content property is provided - lazyLoading or partial
     * invoke redraw on the re-drawable children
     * invoke expand callback
     * notify parent about the change
     * @param {Event} evt
     */
    public expand(evt?: Event) {
        if (this.isActive) {
            return;
        }
        this.setURLPath(evt);
        this.isActive = true;
        this.$lazyLoad();
        this.redrawChildren();
        this.invokeEventCallback('expand', {$event: evt});
        this.notifyParent(true, evt);
    }

    /**
     * handles the pane collapse
     * invoke collapse callback
     * notify parent about the change
     * @param {Event} evt
     */
    public collapse(evt?: Event) {
        if (!this.isActive) {
            return;
        }
        this.isActive = false;
        this.invokeEventCallback('collapse', {$event: evt});
        this.notifyParent(false, evt);
    }

    public toggle(evt: Event) {
        if (this.isActive) {
            this.collapse(evt);
        } else {
            this.expand(evt);
        }
    }

    // Todo - Vinay externalize
    private redrawChildren() {
        setTimeout(() => {
            if (this.reDrawableComponents) {
                this.reDrawableComponents.forEach(c => c.redraw());
            }
        }, 100);
    }

    private notifyParent(isExpand: boolean, evt: Event) {
        this.accordionRef.notifyChange(this, isExpand, evt);
    }

    onPropertyChange(key, nv, ov) {
        if (key === 'content') {
            if (this.isActive) {
                setTimeout(() => this.$lazyLoad(), 100);
            }
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
        styler(
            this.nativeElement.querySelector('.panel-body') as HTMLElement,
            this,
            APPLY_STYLES_TYPE.INNER_SHELL
        );
    }
}
