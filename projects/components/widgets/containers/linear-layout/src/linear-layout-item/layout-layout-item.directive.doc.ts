import { Input } from '@angular/core';

/**
 * The `wmLinearLayoutItem` directive defines a linear layout child component.
 */

export class LinearLayoutItem {
    /**
     * Class of the widget.
     */
    @Input() class: string;
    /**
     * Name of the linear layout widget.
     */
    @Input() name: string;
    /**
     * This property will be used to show/hide the container widget on the web page.
     */
    @Input() show: boolean = true;
    /**
     * The relative share of this widget in space distribution.
     */
    @Input() flexgrow: number;
    /**
     * This property decides the horizontal alignment of children.
     * <p><em>Allowed Values: </em><code>left, center, right</code></p>
     * <div class="summary">
     * <p><code>left</code><em>: Aligns an element to the left.</em></p>
     * <p><code>center</code><em>: Aligns an element to the center.</em></p>
     * <p><code>right</code><em>:  Aligns an element to the right.</em></p>
     * </div>
     * Default value is left.
     */
    @Input() horizontalalign: string;
}