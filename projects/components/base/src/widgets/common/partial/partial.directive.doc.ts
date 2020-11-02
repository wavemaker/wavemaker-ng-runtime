import { Directive } from '@angular/core';

/**
 * The `wmPartial` directive defines a partial.
 */

export class PartialDirective {
    /**
     * Callback function which will be triggered when a cached host page instance is attached to dom.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the partial widget
     */
    onAttach($event: any, widget: any) {}

    /**
     * Callback function which will be triggered when a reusable host page instance is detached from dom.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the partial widget
     */
    onDetach($event: any, widget: any) {}

    /**
     * Callback function which will be triggered when the widget is being destroyed.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the partial widget
     */
    onDestroy($event: MouseEvent, widget: any) {}

    /**
     * Callback function which will be triggered when window is resized.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the page
     * @param data  this is an object which contains screen width and screen height
     */
    onResize($event: Event, widget: any, data: object) {}

    /**
     * Callback function which will be triggered when screen orientation is changed.
     * @param $event  DOM event on which call back is triggered
     */
    onOrientationchange($event: MediaQueryListEvent) {}
}
