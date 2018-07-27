import { Input } from '@angular/core';

/**
 * The wmTile directive defines the tile widget.
 */
export class Tile {

    /**
     * Class of the widget.
     */
    @Input() class: string = 'bg-primary';

    /**
     * This property allows user to bind expression to class property.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() conditionalclass: string;

    /**
     * Name of the tile widget.
     */
    @Input() name: string;

    /**
     * This property will be used to show/hide the tile widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;

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
     * Callback function which will be triggered when the widget is clicked.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the tile widget
     */
    click($event: MouseEvent, widget: any) {}

    /**
     * Callback function which will be triggered when the widget is double clicked.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the tile widget
     */
    dblclick($event: MouseEvent, widget: any) {}

    /**
     * Callback function which will be triggered when the mouse hovers over the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the tile widget
     */
    mouseover($event: MouseEvent, widget: any) {}

    /**
     * Callback function which will be triggered when the mouse moves away from this widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the tile widget
     */
    mouseout($event: MouseEvent, widget: any) {}

    /**
     * Callback function which will be triggered when the mouse enters the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the tile widget
     */
    mouseenter($event: MouseEvent, widget: any) {}

    /**
     * Callback function which will be triggered when the mouse leaves the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the tile widget
     */
    mouseleave($event: MouseEvent, widget: any) {}

    /**
     * Callback function which will be triggered the tap event is triggered on a widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the tile widget
     */
    tap($event: MouseEvent, widget: any) {}

    /**
     * Callback function which will be triggered when the double tap event is triggered on a widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the tile widget
     */
    doubletap($event: MouseEvent, widget: any) {}

    /**
     * Callback function which will be triggered when a swipeup event is triggered.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the tile widget
     */
    swipeup($event: MouseEvent, widget: any) {}

    /**
     * Callback function which will be triggered when a swipedown event is triggered.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the tile widget
     */
    swipedown($event: MouseEvent, widget: any) {}

    /**
     * Callback function which will be triggered when a swipeleft event is triggered.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the tile widget
     */
    swipeleft($event: MouseEvent, widget: any) {}

    /**
     * Callback function which will be triggered when a swiperight event is triggered.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the tile widget
     */
    swiperight($event: MouseEvent, widget: any) {}

    /**
     * Callback function which will be triggered when a pinchin event is triggered.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the tile widget
     */
    pinchin($event: MouseEvent, widget: any) {}

    /**
     * Callback function which will be triggered when a pinchout event is triggered.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the tile widget
     */
    pinchout($event: MouseEvent, widget: any) {}
}