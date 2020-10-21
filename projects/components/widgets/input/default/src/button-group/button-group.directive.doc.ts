import { Input } from '@angular/core';

/**
 * The `wmButtonGroup` directive defines a button group widget.
 */

export class ButtonGroup {
    /**
     * Class of the widget.
     */
    @Input() class: string;
    /**
     * Name of the button group widget.
     */
    @Input() name: string;
    /**
     * Determines whether the buttons should be vertical or not.
     */
    @Input() vertical: string;
    /**
     * This property will be used to show/hide the button group widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;
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
