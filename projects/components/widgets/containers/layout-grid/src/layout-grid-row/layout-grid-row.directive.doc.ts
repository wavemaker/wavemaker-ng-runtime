import { Input, Directive } from '@angular/core';

/**
 * The `wmLayoutGridRow` directive defines a layout grid row component.
 */
@Directive()
export class LayoutGridRow {
    /**
     * Class of the widget.
     */
    @Input() class: string;
    /**
     * Name of the layout grid row component.
     */
    @Input() name: string;
}