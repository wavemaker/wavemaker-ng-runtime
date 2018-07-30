import { Input } from '@angular/core';

/**
 * The `wmLayoutGrid` directive defines a layoutgrid component.
 */
export class Layoutgrid {
    /**
     * Class of the widget.
     */
    @Input() class: string;
    /**
     * Name of the layout grid widget.
     */
    @Input() name: string;
    /**
     * This property adds number of columns into the row.<br>
     * <p><em>Allowed Values: </em><code>1,2,3,4,6,12</code></p>
     */
    @Input() columns: number;
    /**
     * This property will be used to show/hide the composite widget on the web page.
     */
    @Input() show: boolean = true;
}