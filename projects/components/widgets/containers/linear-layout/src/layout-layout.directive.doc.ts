import { Input } from '@angular/core';

/**
 * The `wmLinearLayout` directive defines a linear layout component.
 */

export class LinearLayout {
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
     * The direction in which children have to be arranged.
     * Allowed values are row, row-reverse, column, column-reverse.
     * Default value is row.
     */
    @Input() direction: string;

    /**
     * The amount of space to be maintained between two consecutive childs. 
     * If the linear layout is a immediate child of another linear layout, then spacing 
     * (if not specified or zero) is inherited from the parent linear layout.
     * Default is inherited from parent or 4 (if parent is not present).
     */
     @Input() spacing: number;
    /**
     * If the direction is either row or row-reverse, then the value 
     * of this property decides the horizontal alignment of children.
     * <p><em>Allowed Values: </em><code>left, center, right</code></p>
     * <div class="summary">
     * <p><code>left</code><em>: Aligns an element to the left.</em></p>
     * <p><code>center</code><em>: Aligns an element to the center.</em></p>
     * <p><code>right</code><em>:  Aligns an element to the right.</em></p>
     * </div>
     * Default value is left.
     */
    @Input() horizontalalign: string;

    /**
     * If the direction is either column or column-reverse, then the value 
     * of this property decides the vertical alignment of children.
     * <p><em>Allowed Values: </em><code>left, center, right</code></p>
     * <div class="summary">
     * <p><code>top</code><em>: Aligns an element to the top.</em></p>
     * <p><code>center</code><em>: Aligns an element to the center.</em></p>
     * <p><code>bottom</code><em>:  Aligns an element to the bottom.</em></p>
     * </div>
     * Default value is top.
     */
     @Input() verticalalign: string;
}