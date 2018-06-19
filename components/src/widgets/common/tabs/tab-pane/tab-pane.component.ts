import { AfterViewInit, Attribute, Component, ContentChildren, HostBinding, Injector, OnInit } from '@angular/core';

import { noop, removeAttr } from '@wm/core';

import { APPLY_STYLES_TYPE, styler } from '../../../framework/styler';
import { IWidgetConfig } from '../../../framework/types';
import { registerProps } from './tab-pane.props';
import { StylableComponent } from '../../base/stylable.component';
import { TabsComponent } from '../tabs.component';
import { RedrawableDirective } from '../../redraw/redrawable.directive';
import { provideAsWidgetRef } from '../../../../utils/widget-utils';

registerProps();

const DEFAULT_CLS = 'tab-pane';
const WIDGET_CONFIG: IWidgetConfig = {
    widgetType: 'wm-tabpane',
    hostClass: DEFAULT_CLS
};

@Component({
    selector: 'div[wmTabPane]',
    templateUrl: './tab-pane.component.html',
    providers: [
        provideAsWidgetRef(TabPaneComponent)
    ]
})
export class TabPaneComponent extends StylableComponent implements OnInit, AfterViewInit {

    public $lazyLoad = noop;
    public name: string;
    public show: boolean;

    @HostBinding('class.active') isActive = false;
    @HostBinding('class.disabled') disabled = false;

    // reference to the components which needs a redraw(eg, grid, chart) when the height of this component changes
    @ContentChildren(RedrawableDirective, {descendants: true}) reDrawableComponents;

    constructor(
        inj: Injector,
        private tabsRef: TabsComponent,
        @Attribute('heading') public heading,
        @Attribute('title') public title
    ) {
        super(inj, WIDGET_CONFIG);

        // title property here serves the purpose of heading.
        // TODO: make it common for all the widget.
        removeAttr(this.nativeElement, 'title');
    }

    // parent tabs component will call this method for the order of callbacks to be proper
    // order of callbacks - deselect, select, change
    public invokeOnSelectCallback($event?: Event) {
        this.invokeEventCallback('select', {$event});
    }

    public select($event?: Event) {
        // When called programatically $event won't be available
        if (this.isActive || this.disabled) {
            return;
        }

        this.isActive = true;
        this.$lazyLoad();
        this.redrawChildren();
        this.notifyParent($event);

        if ($event) {
            $event.stopPropagation();
            $event.preventDefault();
        }
    }

    public deselect() {
        if (this.isActive) {
            this.isActive = false;
            this.invokeEventCallback('deselect');
        }
    }

    private redrawChildren() {
        setTimeout(() => {
            if (this.reDrawableComponents) {
                this.reDrawableComponents.forEach(c => c.redraw());
            }
        }, 100);
    }

    private notifyParent(evt?: Event) {
        this.tabsRef.notifyChange(this, evt);
    }

    // select next valid tab
    private handleSwipeLeft() {
        this.tabsRef.selectNext();
    }

    // select prev valid tab
    private handleSwipeRight() {
        this.tabsRef.selectPrev();
    }

    onPropertyChange(key: string, nv: any, ov?: any) {
        if (key === 'content') {
            if (this.isActive) {
                setTimeout(() => this.$lazyLoad(), 100);
            }
        } else {
            super.onPropertyChange(key, nv, ov);
        }
    }

    ngOnInit() {
        super.ngOnInit();
        this.title = this.title || this.heading;
    }

    ngAfterViewInit() {
        styler(
            this.nativeElement.querySelector('.tab-body') as HTMLElement,
            this,
            APPLY_STYLES_TYPE.CONTAINER
        );
        super.ngAfterViewInit();
    }
}
