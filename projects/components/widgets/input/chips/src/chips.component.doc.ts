import { Input, Directive } from '@angular/core';

/**
 * The wmChips component defines the chips widget.
 */
@Directive()
export class Chips {
    /**
     * This property will restrict adding values other than the values in the dropdown, if set to true.
     * By default there is no restriction <br>
     */
    @Input() allowonlyselect: boolean = false;
    /**
     * This property makes the widget get focused automatically when the page loads. <br>
     */
    @Input() autofocus: boolean = false;
    /**
     * Class to be applied on each of the chip item.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() chipclass: string;
    /**
     * Class of the widget.
     */
    @Input() class: string;
    /**
     * This property sets the dataValue to be returned by the chips widget when the list is populated using the dataSet property. <br>
     */
    @Input() datafield: string;
    /*
     * This property accepts the options to create options for search inside the chips.
     * These options can be array of values, array of objects, object containing key-value pairs. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() dataset: Array<any> | Object = 'Option 1, Option 2, Option 3';
    /**
     * This property defines the initial selected value of the chips widget. This adds the default chip items. <br>
     * This accept an array of values too.
     * This value has to be of type as that of the property specified for datafield. If datafield is ALL FIELDS, then pass an object or array of objects to datavalue.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() datavalue: any;
    /**
     * This property will be used to disable the chips widget.
     * If the disabled property is true (checked), the widget becomes display-only. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() disabled: boolean;
    /**
     * This is an advanced property that gives more control over what is displayed in the drop-down select list.
     * A Display Expression uses a JavaScript expression to format exactly what is shown <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() displayexpression: string;
    /**
     * This property sets the displayValue to show in the chip's search results when the list is populated using the dataSet property. <br>
     */
    @Input() displayfield: string;
    /**
     * Picture source sets the image to be displayed in the search results.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() displayimagesrc: string;
    /**
     * This property will allow users to reorder the chip items if set to true. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() enablereorder: boolean;
    /**
     * This property limits the search results to be displayed in the widget
     */
    @Input() limit: number;
    /**
     * The minchars attribute specifies the number of characters that need to be entered before the query is triggered. It must be greater than or equal to 0.
     */
    @Input() minchars: number = 1;
    /**
     * Name of the chips widget.
     */
    @Input() name: string;
    /**
     * Allows to display the data in asc or desc order based on this property <br>
     */
    @Input() orderby: string;
    /**
     * This property specifies the placeholder for the search input in chips. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() placeholder: string;
    /**
     * This property contains the entered text in the search input of chips.
     */
    @Input() query: string;
    /**
     * This property will be used to make the chips widget non-editable. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() readonly: boolean;
    /**
     * This is the property to be searched upon, in the dataset
     */
    @Input() searchkey: string;
    /**
     * The shortcut key property specifies a shortcut key to activate/focus an element.
     */
    @Input() shortcutkey: string;
    /**
     * This property will be used to show/hide the chips widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;
    /**
     * This property shows the search icon when set to true.
     * This value is false when type is set to autocomplete.
     */
    @Input() showsearchicon: boolean;
    /**
     * This property specifies the tab order of the Chip widget.
     */
    @Input() tabindex: number = 0;
    /**
     * This property specifies type of search to be shown in the chips.
     * <p><em>Allowed Values: </em><code>search, autocomplete</code></p>
     * <div class="summary">
     * <p><code>search</code><em>: Atleast one character has to be entered to trigger the search query. </em></p>
     * <p><code>autocomplete</code><em>: automatically triggers the query when the search is focused. </em></p>
     */
    @Input() type: string = 'search';

    /**
     * Callback function which will be triggered on chip addition.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the chips widget
     * @param $item object containing chip data i.e. label(display value), key, value(datavalue), dataObject. dataObject has the object if dataset is bound to array of objects.
     */
    onAdd($event: MouseEvent, widget: any, $item: Object) {}
    /**
     * Callback function which will be triggered before adding the chip. If this function returns false then chip will not be added.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the chips widget
     * @param newItem object containing chip data i.e. label(display value), key, value(datavalue), dataObject. dataObject has the object if dataset is bound to array of objects.
     */
    onBeforeadd($event: MouseEvent, widget: any, newItem: Object) {}
    /**
     * Callback function which will be triggered before removing the chip. If this function returns false then chip will not be removed.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the chips widget
     * @param $item object containing chip data before removing the chip.
     */
    onBeforeremove($event: MouseEvent, widget: any, $item: Object) {}
    /**
     * Callback function which will be triggered before the chip item is reordered.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the chips widget
     * @param $data contains the list of chips data
     * @param $changedItem chip item that has to be reordered.
     */
    onBeforereorder($event: MouseEvent, widget: any, $data: Array<Object>, $changedItem: Object) {}
    /**
     * Callback function which will be triggered before the service call.
     * @param widget  Instance of the chips widget
     * @param inputData object containing filter fields
     */
    onBeforeservicecall(widget: any, inputData: Object) {}
    /**
     * Callback function which will be triggered when chip is clicked.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the chips widget
     * * @param newVal contains the chip data.
     */
    onChipclick($event: MouseEvent, widget: any, newVal: Object) {}
    /**
     * Callback function which will be triggered upon chip selection.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the chips widget
     * @param newVal contains the selected chip data.
     */
    onChipselect($event: MouseEvent, widget: any, newVal: Object) {}
    /**
     * Callback function which will be triggered when datavalue has changed.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the chips widget
     * @param newVal  datavalue of the chips widget
     * @param oldVal  previously selected datavalue of the chips widget
     */
    onChange($event: MouseEvent, widget: any, newVal: Array<any>, oldVal: Array<any>) {}
    /**
     * Callback function which will be triggered on removing chip.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the chips widget
     * @param $item object containing chip data that is removed from chips list.
     */
    onRemove($event: MouseEvent, widget: any, $item: Object) {}
    /**
     * Callback function which will be triggered on reordering of chips.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the chips widget
     * @param $data contains the list of chips data
     * @param $changedItem chip item that is reordered.
     */
    onReorder($event: MouseEvent, widget: any, $data: Array<Object>, $changedItem: Object) {}
}