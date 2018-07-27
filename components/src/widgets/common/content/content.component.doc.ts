import { Input } from '@angular/core';

/**
 * The `wmContent` directive defines a content component.
 */
export class Content {
    /**
     * Class of the widget.
     */
    @Input() class: string;
    /**
     * Name of the content widget.
     */
    @Input() name: string;

    /**
     * Callback function which will be triggered when a swipeup event is triggered.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the content widget
     */
    swipeup($event: TouchEvent, widget: any) {}

    /**
     * Callback function which will be triggered when a swipedown event is triggered.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the content widget
     */
    swipedown($event: TouchEvent, widget: any) {}

    /**
     * Callback function which will be triggered when a swipeleft event is triggered.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the content widget
     */
    swipeleft($event: TouchEvent, widget: any) {}

    /**
     * Callback function which will be triggered when a swiperight event is triggered.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the content widget
     */
    swiperight($event: TouchEvent, widget: any) {}

    /**
     * Callback function which will be triggered when a pinchin event is triggered.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the content widget
     */
    pinchin($event: TouchEvent, widget: any) {}

    /**
     * Callback function which will be triggered when a pinchout event is triggered.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the content widget
     */
    pinchout($event: TouchEvent, widget: any) {}
}