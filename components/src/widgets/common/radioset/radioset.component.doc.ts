import { Input } from '@angular/core';

/**
 * The wmRadioset component defines the radioset widget.
 */
export class Radioset {
    /**
     * Class of the widget.
     */
    @Input() class: string;
    /**
     * This property sets the dataValue to be returned by the radioset widget when the list is populated using the dataSet property. <br>
     */
    @Input() datafield: string;
    /**
     * This property accepts the options to create the radioset widget.
     * These options can be array of values, array of objects, object containing key-value pairs. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() dataset: Array<any> | Object = 'Option 1, Option 2, Option 3';
    /**
     * This property defines the initial selected value of the radioset widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() datavalue: any;
    /**
     * This property will be used to disable the radioset widget.
     * If the disabled property is true (checked), the widget becomes display-only. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() disabled: boolean;
    /**
     * This is an advanced property that gives more control over what is displayed as the label for radio option.
     * A Display Expression uses a Javascript expression to format exactly what is shown <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() displayexpression: string;
    /**
     * This property sets the displayValue to show in the radioset widget when the list is populated using the dataSet property. <br>
     */
    @Input() displayfield: string;
    /**
     * This property allows user to select a pre-defined list class name from the view-list drop down on the right.
     * <p><em>Default Options: </em><code>list-group, media-list</code></p>
     */
    @Input() itemclass: string;
    /**
     * This property controls how contained radio options are displayed within the widget container. <br>
     * <p><em>Allowed Values: </em><code>inline, stacked</code></p>
     * <div class="summary">
     * <p><code>inline</code><em>: radioboxes are aligned inline.</em></p>
     * <p><code>stacked</code><em>: radioboxes are aligned as stacks.</em></p>
     */
    @Input() layout: string = 'stacked';
    /**
     * This property allows user to select a pre-defined list class name from the view-list drop down on the right.
     * <p><em>Default Options: </em><code>list-group-item, media</code></p>
     */
    @Input() listclass: string;
    /**
     * Name of the radioset widget.
     */
    @Input() name: string;
    /**
     * Allows to display the data in asc or desc order based on this property <br>
     */
    @Input() orderby: string;
    /**
     * This property will be used to make the radioset widget non-editable. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() readonly: boolean;
    /**
     * This property will be used to validate the state of the radioset widget when used inside a form widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() required: boolean;
    /**
     * This property will be used to show/hide the radioset widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;
    /**
     * This property specifies the tab order of the radioset widget.
     */
    @Input() tabindex: number = 0;
    /**
     * If set to true, use the keys of the dataset object as radioset options. <br>
     */
    @Input() usekeys: boolean;

    /**
     * Callback function which will be triggered when the widget is clicked.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the radioset widget
     */
    click($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget is clicked.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the radioset widget
     * @param newVal  datavalue of the radioset widget
     * @param oldVal  previously selected datavalue of the radioset widget
     */
    change($event: MouseEvent, widget: any, newVal: any, oldVal: any) {}
    /**
     * Callback function which will be triggered when the mouse enters the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the radioset widget
     */
    mouseenter($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the mouse leaves the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the radioset widget
     */
    mouseleave($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered the tap event is triggered on a widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the radioset widget
     */
    tap($event: TouchEvent, widget: any) {}
}