import { Input, Directive } from '@angular/core';

/**
 * The wmPrefab component defines the prefab widget.
 */
@Directive()
export class Prefab {

    /**
     * Class of the widget.
     */
    @Input() class: string;

    /**
     * Name(Unique across the web page) of the prefab widget.
     */
    @Input() name: string;

    /**
     * This property will be used to show/hide the prefab widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;

    /**
     * Name of prefab to be rendered inside the prefab widget
     */
    @Input() prefabname: string;

    /**
     * Callback function which will be triggered when the widget is loading.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the prefab widget
     */
    onLoad($event: MouseEvent, widget: any) {}

    /**
     * Callback function which will be triggered when the widget is being destroyed.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the prefab widget
     */
    onDestroy($event: MouseEvent, widget: any) {}
    
}