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
    onLoad($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget is swiped up.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the top nav widget
     */
    onSwipeup($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget is swiped down.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the top nav widget
     */
    onSwipedown($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget is swiped right.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the top nav widget
     */
    onSwiperight($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget is swiped left.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the top nav widget
     */
    onSwipeleft($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered on `pinchin` event of the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the top nav widget
     */
    onPinchin($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered on `pinchdown` event the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the top nav widget
     */
    onPinchdown($event: MouseEvent, widget: any) {}

}