import { Input } from '@angular/core';

/**
 * The `wmPage` directive defines the Page component.
 */

export class Page {
    /**
     * This property will be set as the page title in run mode.
     */
    @Input() pagetitle: string;

    /**
     * When a user navigates from a page, the page instance is destroyed. If this property
     * is set to true, then the page instance is saved. If user re-visits the same path, then
     * the saved instance is shown to the user.
     */
    @Input() reuse: string;

    /**
     * If this property is set to true, then variables that have 'load on page startup'
     * as true, are refreshed when a reusable page is attached back.
     */
    @Input() refreshdataonattach: string;

    /**
     * Callback function which will be triggered when a saved reusable page instance is attached to dom.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the page
     */
    onAttach($event: any, widget: any) {}

    /**
     * Callback function which will be triggered when a reusable page instance is detached from dom.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the page
     */
    onDetach($event: any, widget: any) {}

    /**
     * Callback function which will be triggered when a page instance is destroyed.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the page
     */
    onDestroy($event: any, widget: any) {}

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
