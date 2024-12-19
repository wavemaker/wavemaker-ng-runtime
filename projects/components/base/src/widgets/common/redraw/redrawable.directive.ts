import { Directive, Inject, Self } from '@angular/core';

import { IRedrawableComponent, WidgetRef } from '../../framework/types';

@Directive({
    selector: '[redrawable]',
    standalone: false
})
export class RedrawableDirective implements IRedrawableComponent {
    redraw: Function;
    constructor(@Self() @Inject(WidgetRef) widget) {
        this.redraw = () => {
            const tabEl = widget.$element.closest("[wmtabpane]");
            const accordionEl = widget.$element.closest('[wmaccordionpane]').find('.panel-heading');
            if ((tabEl.length && !tabEl.hasClass('active')) || (accordionEl.length && !accordionEl.hasClass('active'))) {
                return;
            }
            return widget.redraw && widget.redraw();
        }
    }
}
