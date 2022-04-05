import { Directive, Inject, Self } from '@angular/core';

import { IRedrawableComponent, WidgetRef } from '../../framework/types';

import { isElementInViewport } from '@wm/core';

@Directive({
    selector: '[redrawable]'
})
export class RedrawableDirective implements IRedrawableComponent {
    redraw: Function;
    constructor(@Self() @Inject(WidgetRef) widget) {
        this.redraw = () => {
            const tabEl = widget.$element.closest("[wmtabpane]");
            const accordionEl = widget.$element.closest('[wmaccordionpane]').find('.panel-heading');
            // WMS-22099: Do not apply redraw on widgets which are already in view
            if (isElementInViewport(widget.$element[0]) || (tabEl.length && !tabEl.hasClass('active')) || (accordionEl.length && !accordionEl.hasClass('active'))) {
                return;
            }
            return widget.redraw && widget.redraw();
        }
    }
}
