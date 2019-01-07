import { Input } from '@angular/core';

/**
 * The `wmCarousel` directive defines a carousel widget.
 */
export class Carousel {
    /**
     * Class of the widget.
     */
    @Input() class: string;
    /**
     * Name of the carousel widget.
     */
    @Input() name: string;
    /**
     * This property will be used to show/hide the carousel widget on the web page.
     */
    @Input() show: boolean = true;
    /**
     * This property allows you to enable the controls for the selected widget<br>
     * <p><em>Allowed Values: </em><code>navs, indicators, both, none</code></p>
     * <div class="summary">
     * <p><code>navs</code><em>: To navigate left and right clickable arrows shows up on the carousel.</em></p>
     * <p><code>indicators</code><em>: To indicate the number of carousel items, small white dots appears and are also clickable.</em></p>
     * <p><code>both</code><em>:  This control enables both navs and indicators.</em></p>
     * <p><code>none</code><em>:  None of the controls available.</em></p>
     * </div>
     */
    @Input() controls: string = 'both';
    /**
     * This property controls the animation of an element. The animation is based on the CSS classes and works only in the run mode.<br>
     * <p><em>Allowed Values: </em><code>auto, none</code></p>
     * <div class="summary">
     * <p><code>auto</code><em>: Select to have an animation on the element</em></p>
     * <p><code>none</code><em>: select for no animation</em></p>
     * </div>
     */
    @Input() animation: string = 'auto';
    /**
     * This property defines the animation interval in seconds.
     */
    @Input() animationinterval: number = 3;
    /**
     * Callback function which will be triggered when the widget is clicked or when datavalue has changed.
     * @param widget Instance of the widget
     * @param newIndex  index of the active carousel in view
     * @param oldIndex  index of the previous carousel in view
     */
    onChange(widget: any, newIndex: number, oldIndex: number) {}
}