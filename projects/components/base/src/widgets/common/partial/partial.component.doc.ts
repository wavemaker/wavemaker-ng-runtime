import { Input, Directive } from '@angular/core';

/**
 * The wmPrefab component defines the prefab widget.
 */
@Directive()
export class Partial {

    /**
     * Callback function which will be triggered when a saved reusable host page instance is attached to dom.
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
    
}