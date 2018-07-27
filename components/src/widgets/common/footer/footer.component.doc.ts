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
    load($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget is swiped up.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the footer widget
     */
    swipeup($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget is swiped down.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the footer widget
     */
    swipedown($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget is swiped right.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the footer widget
     */
    swiperight($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget is swiped left.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the footer widget
     */
    swipeleft($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered on `pinchin` event of the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the footer widget
     */
    pinchin($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered on `pinchdown` event the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the footer widget
     */
    pinchdown($event: MouseEvent, widget: any) {}

}