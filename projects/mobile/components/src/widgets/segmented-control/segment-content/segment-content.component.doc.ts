import { Input } from '@angular/core';

/**
 * The `wmSegmentContent` directive defines the segment content component.
 */
export class SegmentContent {

    /**
     * The property specifies the label of the segmented content.<br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() caption: string;
    /**
     * Class of the widget.
     */
    @Input() class: string;
    /**
     * Html or Partial content of the widget.
     * <p><em>Allowed Values: </em><code>Inline Content, Partials</code></p>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() content: string = "Inline Content";
    /**
     * CSS class of the icon.<br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() iconclass: string;
    /**
     * Name of the Segment content.
     */
    @Input() name: string;
    /**
     * This property will be used to show/hide the segment content widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;
    /**
     * This property defines the load behavior of the container.
     * <p><em>Allowed Values: </em><code>after-select, after-delay</code></p>
     * <div class="summary">
     * <p><code>after-select</code><em>: This property is used to load the container after select.</em></p>
     * <p><code>after-delay</code><em>: This property is used to load the container after delay.</em></p>
     */
    @Input() load: string;
    /**
     * Time in milliseconds, after which the container has to be loaded.
     */
    @Input() loaddelay: number = 10;
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
     * Callback function which will be triggered when widget is loaded.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the segment content widget
     */
    onLoad($event: Event, widget: any) {}
    /**
     * This event handler is called when all the content inside the segment content is loaded.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the segment content widget
     */
    onReady($event: Event, widget: any) {}
}