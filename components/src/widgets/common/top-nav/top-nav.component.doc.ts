import { Input } from '@angular/core';

/**
 * The 'wmTopNav' directive defines a top nav in the layout.
 */
export class TopNav {
    /**
     * Name of the top nav widget.
     */
    @Input() name: string;

    /**
     * Class of the widget.
     */
    @Input() class: string;

    /**
     * Html or Partial content of the widget.
     * <p><em>Allowed Values: </em><code>Inline Content, Top Nav, Partials</code></p>
     */
    @Input() content: string;

    /**
     * Callback function which will be triggered when the widget is loaded.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the top nav widget
     */
    load($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget is swiped up.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the top nav widget
     */
    swipeup($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget is swiped down.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the top nav widget
     */
    swipedown($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget is swiped right.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the top nav widget
     */
    swiperight($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget is swiped left.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the top nav widget
     */
    swipeleft($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered on `pinchin` event of the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the top nav widget
     */
    pinchin($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered on `pinchdown` event the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the top nav widget
     */
    pinchdown($event: MouseEvent, widget: any) {}

}