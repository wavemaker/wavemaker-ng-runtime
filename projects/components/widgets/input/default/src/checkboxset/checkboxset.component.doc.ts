import { Input, Directive } from '@angular/core';

/**
 * The wmCheckboxset component defines the checkboxset widget.
 */
@Directive()
export class Checkboxset {
    /**
     * Class of the widget.
     */
    @Input() class: string;
    /**
     * Enable control for collapsing and expanding the widget when groupby property is set.
     */
    @Input() collapsible: boolean;
    /**
     * This property sets the dataValue to be returned by the checkboxset widget when the list is populated using the dataSet property. <br>
     */
    @Input() datafield: string;
    /**
     * This property accepts the options to create the checkboxset widget.
     * These options can be array of values, array of objects, object containing key-value pairs. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() dataset: Array<any> | Object = 'Option 1, Option 2, Option 3';
    /**
     * This property defines the initial selected value of the checkboxset widget. Returns array of values. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() datavalue: Array<any>;
    /**
     * This property determines the date format to be applied on the group heading
     */
    @Input() dateformat: string;
    /**
     * This property will be used to disable the checkboxset widget.
     * If the disabled property is true (checked), the widget becomes display-only. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() disabled: boolean;
    /**
     * This is an advanced property that gives more control over what is displayed as the checkbox label.
     * A Display Expression uses a JavaScript expression to format exactly what is shown <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() displayexpression: string;
    /**
     * This property sets the displayValue to show in the checkboxset widget when the list is populated using the dataSet property. <br>
     */
    @Input() displayfield: string;
    /**
     * This property allows for grouping the list of rows in the variable bound to a dataset by selecting one of the field names from the drop-down list.
     * This can also be bound to a JavaScript function.
     */
    @Input() groupby: string;
    /**
     * This property allows user to select a pre-defined list class name from the view-list drop down on the right.
     * <p><em>Default Options: </em><code>list-group, media-list</code></p>
     */
    @Input() itemclass: string;
    /**
     * This property controls how contained checkboxes are displayed within the widget container.
     * <p><em>Allowed Values: </em><code>inline, stacked</code></p>
     * <div class="summary">
     * <p><code>inline</code><em>: checkboxes are aligned inline.</em></p>
     * <p><code>stacked</code><em>: checkboxes are aligned as stacks.</em></p>
     */
    @Input() layout: string = 'stacked';
    /**
     * This property allows user to select a pre-defined list class name from the view-list drop down on the right.
     * <p><em>Default Options: </em><code>list-group-item, media</code></p>
     */
    @Input() listclass: string;
    /**
     * When "Group as" property is set to
     * 1. alphabetic, the group heading will contain the starting character of the grouped data key
     * 2. word, the group heading will contain the word.
     * 3. any of the TIME options, data is grouped based on the time option given
     */
    @Input() match: string;
    /**
     * Name of the checkboxset widget.
     */
    @Input() name: string;
    /**
     * Allows to display the data in asc or desc order based on this property <br>
     */
    @Input() orderby: string;
    /**
     * This property will be used to make the checkboxset widget non-editable. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() readonly: boolean;
    /**
     * This property will be used to validate the state of the checkboxset widget when used inside a form widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() required: boolean;
    /**
     * This property will be used to show/hide the checkboxset widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;
    /**
     * Count of checkbox items in list group will be shown, if set to true
     */
    @Input() showcount: boolean;
    /**
     * This property specifies the tab order of the checkboxset widget.
     */
    @Input() tabindex: number = 0;
    /**
     * If set to true, use the keys of the dataset object as checkboxset options. <br>
     */
    @Input() usekeys: boolean;

    /**
     * Callback function which will be triggered when the widget is clicked.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the checkboxset widget
     */
    onClick($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget is clicked or when datavalue has changed.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the checkboxset widget
     * @param newVal  datavalue of the checkboxset widget
     * @param oldVal  previously selected datavalue of the checkboxset widget
     */
    onChange($event: MouseEvent, widget: any, newVal: any, oldVal: any) {}
    /**
     * Callback function which will be triggered when the mouse enters the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the checkboxset widget
     */
    onMouseenter($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the mouse leaves the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the checkboxset widget
     */
    onMouseleave($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the tap event is triggered on a widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the checkboxset widget
     */
    onTap($event: TouchEvent, widget: any) {}
    /**
     * This can be invoked only when groupby and collapsible properties are set. This method is available on widget instance.
     * This method toggles all the list items inside the each list group i.e. all the group lists can be collapsed or expanded.
     */
    toggleAllHeaders() {}
}