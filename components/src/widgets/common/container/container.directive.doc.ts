import { Input } from '@angular/core';

/**
 * The `wmContainer` directive defines a container widget.
 */
export class Container {
    /**
     * Class of the widget.
     */
    @Input() class: string;
    /**
     * This property allows user to bind expression to class property.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() conditionalclass: string;
    /**
     * Name of the container widget.
     */
    @Input() name: string;
    /**
     * Sets content for the container. <br>
     * <p><em>Allowed Values: </em><code>Inline Content or partials</code></p>
     * <div class="summary">
     * <p><code>Inline Content</code><em>: To drag and drop any widget.</em></p>
     * <p><code>Partials</code><em>: To select from available list of partials.</em></p>
     */
    @Input() content: string = 'Inline Content';
    /**
     * This property will be used to show/hide the container widget on the web page.
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
     * This event handler is called when the widget is loaded.
     * @param widget  Instance of the container widget
     */
    load(widget: any) {}

    /**
     * Callback function which will be triggered when the widget is clicked.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the container widget
     */
    click($event: MouseEvent, widget: any) {}

    /**
     * Callback function which will be triggered when the widget is double clicked.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the container widget
     */
    dblclick($event: MouseEvent, widget: any) {}

    /**
     * Callback function which will be triggered when the mouse hovers over the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the container widget
     */
    mouseover($event: MouseEvent, widget: any) {}

    /**
     * Callback function which will be triggered when the mouse moves away from this widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the container widget
     */
    mouseout($event: MouseEvent, widget: any) {}

    /**
     * Callback function which will be triggered when the mouse enters the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the container widget
     */
    mouseenter($event: MouseEvent, widget: any) {}

    /**
     * Callback function which will be triggered when the mouse leaves the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the container widget
     */
    mouseleave($event: MouseEvent, widget: any) {}

    /**
     * Callback function which will be triggered the tap event is triggered on a widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the container widget
     */
    tap($event: TouchEvent, widget: any) {}

    /**
     * Callback function which will be triggered when the double tap event is triggered on a widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the container widget
     */
    doubletap($event: TouchEvent, widget: any) {}

    /**
     * Callback function which will be triggered when a swipeup event is triggered.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the container widget
     */
    swipeup($event: TouchEvent, widget: any) {}

    /**
     * Callback function which will be triggered when a swipedown event is triggered.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the container widget
     */
    swipedown($event: TouchEvent, widget: any) {}

    /**
     * Callback function which will be triggered when a swipeleft event is triggered.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the container widget
     */
    swipeleft($event: TouchEvent, widget: any) {}

    /**
     * Callback function which will be triggered when a swiperight event is triggered.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the container widget
     */
    swiperight($event: TouchEvent, widget: any) {}

    /**
     * Callback function which will be triggered when a pinchin event is triggered.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the container widget
     */
    pinchin($event: TouchEvent, widget: any) {}

    /**
     * Callback function which will be triggered when a pinchout event is triggered.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the container widget
     */
    pinchout($event: TouchEvent, widget: any) {}
}