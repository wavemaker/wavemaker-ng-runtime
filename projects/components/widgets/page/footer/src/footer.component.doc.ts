import { Input } from '@angular/core';

/**
 * The 'wmFooter' directive defines a footer in the layout.
 */

export class Footer {
    /**
     * Name of the footer widget.
     */
    @Input() name: string;

    /**
     * Class of the widget.
     */
    @Input() class: string;

    /**
     * Html or Partial content of the widget.
     * <p><em>Allowed Values: </em><code>Inline Content, Footer, Partials</code></p>
     */
    @Input() content: string;

    /**
     * Callback function which will be triggered when the widget is loaded.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the footer widget
     */
    onLoad($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget is swiped up.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the footer widget
     */
    onSwipeup($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget is swiped down.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the footer widget
     */
    onSwipedown($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget is swiped right.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the footer widget
     */
    onSwiperight($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget is swiped left.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the footer widget
     */
    onSwipeleft($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered on `pinchin` event of the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the footer widget
     */
    onPinchin($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered on pinchdown event of the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the footer widget
     */
    onPinchdown($event: MouseEvent, widget: any) {}

}