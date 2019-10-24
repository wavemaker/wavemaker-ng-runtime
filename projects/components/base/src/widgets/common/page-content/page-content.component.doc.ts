import { Input } from '@angular/core';

/**
 * The wmPageContent directive defines the page content component.
 */
export class PageContent {

    /**
     * Class of the widget.
     */
    @Input() class: string;

    /**
     * Name of the Pagecontent widget.
     */
    @Input() name: string;
    /**
     * This property changes the width of the page content. <br>
     * <p><em>Allowed Values: </em><code>1,2,3,4,5,6,7,8,9,10,11,12</code></p>
     */
    @Input() columnwidth: number;
    /**
     * Callback function which will be triggered when a swipeup event is triggered.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the page content component
     */
    onSwipeup($event: TouchEvent, widget: any) {}

    /**
     * Callback function which will be triggered when a swipedown event is triggered.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the page content component
     */
    onSwipedown($event: TouchEvent, widget: any) {}

    /**
     * Callback function which will be triggered when a swipeleft event is triggered.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the page content component
     */
    onSwipeleft($event: TouchEvent, widget: any) {}

    /**
     * Callback function which will be triggered when a swiperight event is triggered.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the page content component
     */
    onSwiperight($event: TouchEvent, widget: any) {}

    /**
     * Callback function which will be triggered when a pinchin event is triggered.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the page content component
     */
    onPinchin($event: TouchEvent, widget: any) {}

    /**
     * Callback function which will be triggered when a pinchout event is triggered.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the page content component
     */
    onPinchout($event: TouchEvent, widget: any) {}
}