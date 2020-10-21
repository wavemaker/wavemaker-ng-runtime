import { Input } from '@angular/core';

/**
 * The `wmLabel` directive defines the label widget.
 */

export class Label {

    /**
     * This property specifies the label of the Label widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() caption: string;
    /**
     * This property allows user to bind expression to class property.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() conditionalclass: string;
    /**
     * Hint text is shown for the label widget on hover. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() hint: string;
    /**
     * This property allows the label to add a required field when used within wm.LiveForm.
     */
    @Input() required: boolean = false;
    /**
     * Name of the label widget.
     */
    @Input() name: string;
    /**
     * This property will be used to show/hide the label widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;

    /**
     * Callback function which will be triggered when the widget is clicked.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the label widget
     */
    onClick($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget is double clicked.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the label widget
     */
    onDblclick($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the mouse enters the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the label widget
     */
   onMouseenter($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the mouse leaves the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the label widget
     */
    onMouseleave($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the tap event is triggered on a widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the label widget
     */
    onTap($event: TouchEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the double tap event is triggered on a widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the label widget
     */
    onDoubletap($event: TouchEvent, widget: any) {}
}