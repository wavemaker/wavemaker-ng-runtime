import { Input, Directive } from '@angular/core';

/**
 * The 'wmRightPanel' directive defines a right panel in the layout.
 * wmRightPanel is internally used by wmContent.
 */
@Directive()
export class RightPanel {
    /**
     * Name of the right panel widget.
     */
    @Input() name: string;

    /**
     * Class of the widget.
     */
    @Input() class: string;

    /**
     * Html or Partial content of the widget.
     * <p><em>Allowed Values: </em><code>Inline Content, Right Panel, Partials</code></p>
     */
    @Input() content: string;

    /**
     * This property specifies the width of the widget inside wmContent widget. Adds class col-md-(x), to suit bootstrap fluid grid system
     * Adds class col-md-(x), to suit bootstrap fluid grid system
     * <p><em>Allowed Values: </em><code>Integer(x); (1 <= x <= 12)</code></p>
     */
    @Input() columnwidth: number = 2;

    /**
     * Callback function which will be triggered when the widget is loaded.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the right panel widget
     */
    onLoad($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget is swiped up.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the right panel widget
     */
    onSwipeup($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget is swiped down.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the right panel widget
     */
    onSwipedown($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget is swiped right.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the right panel widget
     */
    onSwiperight($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget is swiped left.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the right panel widget
     */
    onSwipeleft($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered on `pinchin` event of the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the right panel widget
     */
    onPinchin($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered on `pinchdown` event the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the right panel widget
     */
    onPinchdown($event: MouseEvent, widget: any) {}

}