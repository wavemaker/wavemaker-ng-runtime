import { Input } from '@angular/core';

/**
 * The wmCardContent component defines the card content.
 */

export class CardContent {
    /**
     * Class of the widget.
     */
    @Input() class: string;
    /**
     * Html or Partial content of the widget.
     * <p><em>Allowed Values: </em><code>Inline Content, Partials</code></p>
     */
    @Input() content: string;
    /**
     * Name of the card content widget.
     */
    @Input() name: string;
    /**
     * This property will be used to show/hide the Card Content widget on the web page.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;

    /**
     * Callback function which will be triggered when the widget is loaded.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the card content widget
     * @param item  Data of the card content on which load event is triggered
     * @param currentItemWidgets Widgets inside the card content on which load event is triggered
     */
    load($event: MouseEvent, widget: any, item: any, currentItemWidgets: any) {}

}