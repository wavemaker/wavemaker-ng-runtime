import { Input } from '@angular/core';

/**
 * The wmSearch component defines the search widget.
 */
export class Search {
    /**
     * Class of the widget.
     */
    @Input() class: string;
    /**
     * This message will be displayed when there there is no more data to load.
     */
    @Input() datacompletemsg: string = 'No more data to load';
    /**
     * This property sets the dataValue to be returned by the search widget when the list is populated using the dataSet property. <br>
     */
    @Input() datafield: string;
    /**
     * This property accepts the options to create the search widget.
     * These options can be array of values, array of objects, object containing key-value pairs. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() dataset: Array<any> | Object;
    /**
     * This property defines the initial selected value of the search widget. <br>
     * This cannot accept an array of values.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() datavalue: any;
    /**
     * This property will be used to disable the search widget.
     * If the disabled property is true (checked), the widget becomes display-only. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() disabled: boolean;
    /**
     * Picture source sets the image to be displayed in the search results.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() displayimagesrc: string;
    /**
     * This property sets the displayValue to show in the search widget when the list is populated using the dataSet property. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() displaylabel: string;
    /**
     * This property specifies the title/hint of the search. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() hint: string;
    /**
     * Picture width This property allows to set the width of the picture.
     */
    @Input() imagewidth: boolean;
    /**
     * This property limits the search results to be displayed in the widget
     */
    @Input() limit: number;
    /**
     * This message will be displayed when waiting for data to load.
     */
    @Input() loadingdatamsg: string = 'Loading items...';
    /**
     * The minchars attribute specifies the number of characters that need to be entered before the query is triggered. It must be greater than or equal to 0.
     */
    @Input() minchars: number;
    /**
     * Name of the search widget.
     */
    @Input() name: string;
    /**
     * Allows to display the data in asc or desc order based on this property <br>
     */
    @Input() orderby: string;
    /**
     * This property specifies the placeholder for the search. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() placeholder: string;
    /**
     * This property contains the entered text in the search input.
     */
    @Input() query: string;
    /**
     * This property will be used to make the search widget non-editable. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() readonly: boolean;
    /**
     * This property will be used to validate the state of the search widget when used inside a form widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() required: boolean;
    /**
     * This is the property to be searched upon, in the list object
     */
    @Input() searchkey: string;
    /**
     * The shortcut key property specifies a shortcut key to activate/focus an element.
     */
    @Input() shortcutkey: string;
    /**
     * This property will be used to show/hide the search widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;
    /**
     * This property shows the search icon when set to true.
     * This value is false for autocomplete.
     */
    @Input() showsearchicon: boolean;
    /**
     * This property specifies the tab order of the search widget.
     */
    @Input() tabindex: number = 0;
    /**
     * This property specifies type of search.
     * <p><em>Allowed Values: </em><code>search, autocomplete</code></p>
     * <div class="summary">
     * <p><code>search</code><em>: Atleast one character has to be entered to trigger the search query. </em></p>
     * <p><code>autocomplete</code><em>: automatically triggers the query when the search is focused. </em></p>
     */
    @Input() type: string = 'search';

    /**
     * Callback function which will be triggered before the service call.
     * @param widget  Instance of the search widget
     * @param inputData object containing filter fields
     */
    beforeservicecall(widget: any, inputData: Object) {}
    /**
     * Callback function which will be triggered when the widget loses focus.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the search widget
     */
    blur($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget is clicked or when datavalue has changed.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the search widget
     * @param newVal  datavalue of the search widget
     * @param oldVal  previously selected datavalue of the search widget
     */
    change($event: MouseEvent, widget: any, newVal: any, oldVal: any) {}
    /**
     * Callback function which will be triggered when the widget gets focused.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the search widget
     */
    focus($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered on the search submit.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the search widget
     */
    submit($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered on selecting a item from the search results.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the search widget
     * @param selectedValue represents the datavalue of search widget.
     */
    select($event: MouseEvent, widget: any, selectedValue: any) {}
}