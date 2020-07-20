import { Input, Directive } from '@angular/core';

/**
 * The wmSwitch component defines the switch widget.
 */
@Directive()
export class Switch {
    /**
     * Class of the widget.
     */
    @Input() class: string;
    /**
     * This property sets the dataValue to be returned by the switch widget when the list is populated using the dataSet property. <br>
     */
    @Input() datafield: string;
    /**
     * This property accepts the options to create the switch widget.
     * These options can be array of values, array of objects, object containing key-value pairs. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() dataset: Array<any> | Object = 'yes, no, maybe';
    /**
     * This property defines the initial selected value of the switch widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() datavalue: any = 'yes';
    /**
     * This property will be used to disable the switch widget.
     * If the disabled property is true (checked), the widget becomes display-only. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() disabled: boolean;
    /**
     * This is an advanced property that gives more control over what is displayed in the switch options.
     * A Display Expression uses a JavaScript expression to format exactly what is shown <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() displayexpression: string;
    /**
     * This property sets the displayValue to show in the switch widget when the list is populated using the dataSet property. <br>
     */
    @Input() displayfield: string;
    /**
     * Hint text is shown for the switch widget on hover. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() hint: string;
    /**
     * CSS class of the icon.
     */
    @Input() iconclass: string;
    /**
     * Name of the switch widget.
     */
    @Input() name: string;
    /**
     * Allows to display the data in asc or desc order based on this property <br>
     */
    @Input() orderby: string;
    /**
     * This property will be used to validate the state of the switch widget when used inside a form widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() required: boolean;
    /**
     * This property will be used to show/hide the switch widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;
    /**
     * This property specifies the tab order of the switch widget.
     */
    @Input() tabindex: number = 0;

    /**
     * Callback function which will be triggered when the widget is clicked.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the switch widget
     */
    onClick($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget is clicked or datavalue has changed.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the switch widget
     * @param newVal  datavalue of the switch widget
     * @param oldVal  previously selected datavalue of the switch widget
     */
    onChange($event: MouseEvent, widget: any, newVal: any, oldVal: any) {}
    /**
     * Callback function which will be triggered when the mouse enters the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the switch widget
     */
    onMouseenter($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the mouse leaves the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the switch widget
     */
    onMouseleave($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the tap event is triggered on a widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the switch widget
     */
    onTap($event: TouchEvent, widget: any) {}
}