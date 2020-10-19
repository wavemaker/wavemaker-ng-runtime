import { Input, Directive } from '@angular/core';

/**
 * The wmTableColumn component defines the table column widget.
 */
@Directive()
export class TableColumn {
    /**
     * CSS class for styling the column.
     */
    @Input() colClass: string;
    /**
     * Datatype the column.
     */
    @Input() type: string = 'string';
    /**
     * This property allows user to bind expression to column class property.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() colNgClass: string;
    /**
     * The binding for the column. It is the target column in the data object the table is bound to.
     */
    @Input() binding: string;
    /**
     * This property specifies the title of the column header. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() caption: string;
    /**
     * This property defines the value of the widget when the element is in the checked state.<br>
     * Default value is boolean value true. If specified, the value will be of string type.
     */
    @Input() checkedvalue: string;
    /**
     * Specify the currency code such as 'USD'.
     */
    @Input() currencypattern: string;
    /**
     * Custom expression for the column. Select one of the available widgets from above list or provide a custom expression here (for more info click on the 'Help' link above).
     */
    @Input() customExpression: boolean;
    /**
     * This property sets the dataValue to be returned by the dataset widget when the list is populated using the dataSet property. <br>
     */
    @Input() datafield: string;
    /**
     * This property sets the filter dataValue to be returned by the dataset widget when the list is populated using the dataSet property. <br>
     */
    @Input() filterdatafield: string;
    /**
     * This property accepts the options to create the dataset widget.
     * These options can be array of values, array of objects, object containing key-value pairs. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() dataset: Array<any> | Object;
    /**
     * This property defines the initial selected value of the dataset widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() datavalue: any;
    /**
     * This property defines the default value for the widget in inline or quick edit. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() defaultvalue: any;
    /**
     * This property sets the displayValue to show in the dataset widget when the list is populated using the dataSet property. <br>
     */
    @Input() displayfield: string;
    /**
     * This property sets the displayValue to show in the dataset widget when the list is populated using the dataSet property. <br>
     */
    @Input() displaylabel: string;
    /**
     * This property sets the filter displayValue to show in the dataset widget when the list is populated using the dataSet property. <br>
     */
    @Input() filterdisplayfield: string;
    /**
     * This property sets the filter displayValue to show in the dataset widget when the list is populated using the dataSet property. <br>
     */
    @Input() filterdisplaylabel: string;
    /**
     * This property defines the display pattern of column in view mode.<br>
     * <p><em>Allowed Values: </em><code>Standard Patterns like 'yyyy-MM-dd hh:mm:ss a', 'yyyy-MM-ddTHH:mm:ss', 'yyyy, MMM dd', etc. </code></p>
     */
    @Input() datepattern: string;
    /**
     * This property display pattern of the datetime widget in inline or quick edit.<br>
     * <p><em>Allowed Values: </em><code>Standard Patterns like 'yyyy-MM-dd hh:mm:ss a', 'yyyy-MM-ddTHH:mm:ss', 'yyyy, MMM dd', etc. </code></p>
     */
    @Input() editdatepattern: string;

    /**
     * Widget type in the inline or quick edit.
     */
    @Input() editWidgetType: string;
    /**
     * Expression against the column to be displayed when data is exported. E.g. (firstname + lastname). If left empty, actual value against the column will be displayed.
     */
    @Input() exportexpression: string;
    /**
     * Filters the values for the current field when the 'Filter on field' value changes.
     */
    @Input() filterOn: string;
    /**
     * Set the number of decimal places that are displayed.
     */
    @Input() fractionsize: number;
    /**
     * This property is used to specify a format from the allowed values.<br>
     * <p><em>Allowed Values: </em><code>toDate, toCurrency, prefix, suffix, numberToString, stringToNumber, timeFromNow, None</code></p>
     */
    @Input() formatpattern: string;
    /**
     * Limits the data to be displayed in the widget.<br>
     */
    @Input() limit: boolean = true;
    /**
     * A placeholder is text to show in the editor when there is no value.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() placeholder: string = 'Enter text';
    /**
     * This property will be used to show/hide the column. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;
    /**
     * This property will be used to make the column non-editable. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() readonly: boolean = false;
    /**
     * This property determines required validation for a column.
     */
    @Input() required: boolean = false;
    /**
     * This is the property to be searched upon
     */
    @Input() searchkey: string;
    /**
     * This property enables search on the column.
     */
    @Input() searchable: string;
    /**
     * This property determines the position at which row actions column has to be rendered.
     */
    @Input() rowactionsposition: string;
    /**
     * If the Value is set to default Date/Datetime/time picker will be opened on both input click and button click, else picker will be opened only button click.
     */
    @Input() showdropdownon: string = 'default';
    /**
     * This property specifies how the user can enter data.If the Value is set to default, data entry can be done either by selecting from the Date/DateTime/Time Picker or by entering manually through the keyboard, else data entry can be done only by selecting from the Date/DateTime/Time Picker.
     */
    @Input() dataentrymode: string = 'default';
    /**
     * This property enables sort on the column.
     */
    @Input() sortable: boolean = true;
    /**
     * Text to append to the start of each column data.
     */
    @Input() prefix: string;
    /**
     * Text to append to the end of each column data.
     */
    @Input() suffix: string;
    /**
     * Type of the widget in the view mode. <br>
     * <p><em>Allowed Values: </em><code>anchor, button, checkbox, icon, image, label</code></p>
     */
    @Input() widgetType: string;
    /**
     * This property will be used to disable/enable the table column on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() disabled: boolean;
    /**
     * This property defines the value of the widget when the element is in the unchecked state.
     */
    @Input() uncheckedvalue: string;
    /**
     * This property is to show the column in web view.
     */
    @Input() pcdisplay: string;
    /**
     * This property is to show the column in mobile view.
     */
    @Input() mobiledisplay: string;
}
