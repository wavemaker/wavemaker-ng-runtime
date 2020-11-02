import { Input } from '@angular/core';

/**
 * The wmMessage component defines the message widget.
 */

export class Message {
    /**
     * This property specifies the label of the message. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() caption: string;
    /**
     * Class of the widget.
     */
    @Input() class: string;
    /**
     * This property helps to manage the close button visibility.
     */
    @Input() hideclose: boolean = false;
    /**
     * Name of the message widget.
     */
    @Input() name: string;
    /**
     * This property will be used to show/hide the message widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;
    /**
     * Type of the message widget. <br>
     * <p><em>Allowed Values: </em><code>error, info, loading, success, warning</code></p>
     * <div class="summary">
     * <p><code>error</code><em>: Indicates a dangerous or potentially negative message</em></p>
     * <p><code>info</code><em>: Indicates a neutral informative message</em></p>
     * <p><code>loading</code><em>:  Indicates loading status message</em></p>
     * <p><code>success</code><em>:  Indicates a successful or positive message</em></p>
     * <p><code>warning</code><em>:  Indicates a warning message that might need attention</em></p>
     * </div>
     */
    @Input() type: string = 'success';

    /**
     * Callback function which will be triggered when message widget is closed.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the message widget
     */
    onClose($event: MouseEvent, widget: any) {}
}