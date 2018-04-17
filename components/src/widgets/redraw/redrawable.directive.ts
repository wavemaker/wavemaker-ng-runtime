import { Directive, Inject, Self } from '@angular/core';
import { IRedrawableComponent } from './redrawable.interface';

@Directive({
    selector: '[redrawable]'
})
export class RedrawableDirective implements IRedrawableComponent {
    redraw: Function;
    constructor(@Self() @Inject('@Widget') widget) {
        this.redraw = () => widget.redraw();
    }
}
