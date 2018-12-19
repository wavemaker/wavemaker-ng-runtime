import { Input } from '@angular/core';

/**
 * The `wmLayoutGridColumn` directive defines a layout grid column widget.
 */
export class LayoutGridColumn {
    /**
     * Class of the widget.
     */
    @Input() class: string;
    /**
     * Name of the layout grid column component.
     */
    @Input() name: string;
    /**
     * This property adds number of columns to the row. <br>
     * <p><em>Allowed Values: </em><code>1,2,3,4,5,6,7,8,9,10,11,12</code></p>
     */
     @Input() columnwidth: number;
    /**
     * This property specifies how the elements should be aligned horizontally. <br>
     * <p><em>Allowed Values: </em><code>left, center, right</code></p>
     * <div class="summary">
     * <p><code>left</code><em>: Aligns an element to the left.</em></p>
     * <p><code>center</code><em>: Aligns an element to the center.</em></p>
     * <p><code>right</code><em>:  Aligns an element to the right.</em></p>
     * </div>
     */
    @Input() horizontalalign: string;
}