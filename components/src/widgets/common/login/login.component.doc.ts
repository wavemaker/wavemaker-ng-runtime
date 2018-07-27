import { Input } from '@angular/core';

/**
 * The wmLogin component defines the login widget.
 */
export class Login {

    /**
     * Name of the login widget.
     */
    @Input() name: string;
    /**
     * This property will be used to show/hide the show widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;
    /**
     * This message will be displayed, if there is an error during the login operation. <br>
     */
    @Input() errormessage: string;

    /**
     * This event handler is called whenever a submit event is triggered.
     * @param $event DOM event on which call back is triggered
     * @param widget Instance of the widget
     */
    submit($event: MouseEvent, widget: any) {}
    /**
     * This event handler is called before rendering the fields.
     * @param $event DOM event on which call back is triggered
     * @param widget Instance of the widget
     */
    beforerender($event: MouseEvent, widget: any) {}
    /**
     * This event handler is called whenever a success event is triggered.
     * @param $event DOM event on which call back is triggered
     * @param widget Instance of the widget
     */
    success($event: MouseEvent, widget: any) {}
    /**
     * This event handler is called whenever an error event is triggered.
     * @param $event DOM event on which call back is triggered
     * @param widget Instance of the widget
     */
    error($event: MouseEvent, widget: any) {}


}