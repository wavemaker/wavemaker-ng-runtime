import { Directive, Inject, Self } from '@angular/core';

import { IRedrawableComponent, WidgetRef } from '../../framework/types';

@Directive({
  standalone: true,
    selector: '[redrawable]'
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
            if (widget.widgetType.startsWith('wm-prefab')) {
                Object.entries(widget.Widgets || {}).forEach(([key, innerWidget]: [string, any]) => {
                    if (typeof innerWidget.redraw === 'function') {
                        innerWidget.redraw();
                    }
                });
                return
            } else {
            return widget.redraw && widget.redraw();
            }
        }
    }
}
