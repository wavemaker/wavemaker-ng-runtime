import { Input } from '@angular/core';

/**
 * The `wmComposite` directive defines a composite widget.
 */
export class Composite {
    /**
     * Class of the widget.
     */
    @Input() class: string;
    /**
     * Name of the composite widget.
     */
    @Input() name: string;
    /**
     * This property determines required validation for a field.
     */
    @Input() required: boolean = false;
    /**
     * This property will be used to show/hide the composite widget on the web page.
     */
    @Input() show: boolean = true;
    /**
     * This property determines where is caption appearing with respect to the field.<br>
     * <p><em>Allowed Values: </em><code>left, right, top</code></p>
     * <div class="summary">
     * <p><code>left</code><em>: Aligns caption to the left.</em></p>
     * <p><code>right</code><em>: Aligns caption to the center.</em></p>
     * <p><code>top</code><em>:  Aligns caption to the right.</em></p>
     * </div>
     */
    @Input() captionposition: string;
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