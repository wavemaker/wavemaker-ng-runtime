import { Directive, Inject, Self } from '@angular/core';

import { IRedrawableComponent, WidgetRef } from '../../framework/types';

@Directive({
    selector: '[redrawable]'
})
export class RedrawableDirective implements IRedrawableComponent {
    redraw: Function;
    constructor(@Self() @Inject(WidgetRef) widget) {
        this.redraw = () => widget.redraw();
    }
}
