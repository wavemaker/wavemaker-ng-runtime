import { Input } from '@angular/core';

/**
 * The 'wmLeftPanel' directive defines a left panel in the layout.
 * wmLeftPanel is internally used by wmContent.
 */
export class LeftPanel {
    /**
     * Name of the left panel widget.
     */
    @Input() name: string;

    /**
     * Class of the widget.
     */
    @Input() class: string;

    /**
     * Html or Partial content of the widget.
     * <p><em>Allowed Values: </em><code>Inline Content, Left Panel, Partials</code></p>
     */
    @Input() content: string;

    /**
     * This property specifies how much width should occupy by the widget in side `wmContent` widget.
     * Adds class col-md-(x), to suit bootstrap fluid grid system
     * <p><em>Allowed Values: </em><code>Integer(x); (1 <= x <= 12)</code></p>
     */
    @Input() columnwidth: number = 2;

    /**
     * This property specifies to enable/disable the gestures on the widget.
     */
    @Input() gestures:string = 'on';

    /**
     * Callback function which will be triggered when the widget is loaded.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the left panel widget
     */
    load($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget is swiped up.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the left panel widget
     */
    swipeup($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget is swiped down.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the left panel widget
     */
    swipedown($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget is swiped right.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the left panel widget
     */
    swiperight($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget is swiped left.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the left panel widget
     */
    swipeleft($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered on `pinchin` event of the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the left panel widget
     */
    pinchin($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered on `pinchdown` event the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the left panel widget
     */
    pinchdown($event: MouseEvent, widget: any) {}

}