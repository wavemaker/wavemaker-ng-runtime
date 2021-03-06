import { Input } from '@angular/core';

/**
 * The wmCardActions directive defines the card actions.
 */


export class CardActions {
    /**
     * Class of the widget.
     */
    @Input() class: string;
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
    /**
     * Name of the card actions widget.
     */
    @Input() name: string;
    /**
     * This property will be used to show/hide the Card Actions widget on the web page.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;

}