import { Input } from '@angular/core';

/**
 * The `wmCarouselTemplate` directive defines a carousel template component.
 */
export class CarouselTemplate {
    /**
     * Class of the widget.
     */
    @Input() class: string;
    /**
     * Name of the carousel template widget.
     */
    @Input() name: string;
    /**
     * This property will be used to show/hide the carousel template widget on the web page.
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