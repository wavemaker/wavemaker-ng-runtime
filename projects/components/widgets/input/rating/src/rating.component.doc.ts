import { Input } from '@angular/core';

/**
 * The wmRating component defines the rating widget.
 */

export class Rating {
    /**
     * Class of the widget.
     */
    @Input() class: string;
    /**
     * This property sets the dataValue to be returned by the rating widget when the rating is populated using the dataSet property. <br>
     */
    @Input() datafield: string;
    /**
     * This property accepts the options to create the rating widget.
     * These options can be array of values, array of objects, object containing key-value pairs. <br>
     * When dataset is not provided, rating is mapped with values using the maxValue property and shows the values as 1,2,3 ... upto maxValue
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() dataset: Array<any> | Object;
    /**
     * This property defines the initial selected value of the rating widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() datavalue: Array<any>;
    /**
     * This is an advanced property that gives more control over what is displayed as the rating caption.
     * A Display Expression uses a JavaScript expression to format exactly what is shown <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() displayexpression: string;
    /**
     * This property sets the displayValue to show in the rating widget when the list is populated using the dataSet property. <br>
     */
    @Input() displayfield: string;
    /**
     * This property specifies the icon color.
     */
    @Input() iconcolor: string;
    /**
     * This property specifies the icon size
     */
    @Input() iconsize: string;
    /**
     * This property specifies the max number of stars to be displayed. It should be less than or equal to 10.
     */
    @Input() maxvalue: number = 5;
    /**
     * Name of the rating widget.
     */
    @Input() name: string;
    /**
     * This property will be used to make the rating widget non-editable. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() readonly: boolean;
    /**
     * This property will be used to show/hide the rating widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;
    /**
     * Captions will be visible on mouse hover or on selection, if set to true
     */
    @Input() showcaptions: boolean = true;
    /**
     * This property specifies the tab order of the rating widget.
     */
    @Input() tabindex: number = 0;

    /**
     * Callback function which will be triggered when the widget is clicked or when datavalue has changed.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the rating widget
     * @param newVal  datavalue of the rating widget
     * @param oldVal  previously selected datavalue of the rating widget
     */
    onChange($event: MouseEvent, widget: any, newVal: any, oldVal: any) {}
}