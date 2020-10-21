import { Input } from '@angular/core';

/**
 * The wmFormField component defines the form field widget.
 */

export class FormField {
    /**
     * Class of the widget.
     */
    @Input() class: string;
    /**
     * Name of the form field widget.
     */
    @Input() name: string;
    /**
     * This is the default value to display value for an editor widget. Note that the display value is just what the user sees initially, and is not always the dataValue returned by the widget.<br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() datavalue: string;
    /**
     * Sets the title of the form field component.
     */
    @Input() displayname: string;
    /**
     * The binding for the column. It is the target column in the data object the grid is bound to.
     */
    @Input() field: string;
    /**
     * Filters the values for the current field when the 'Filter on field' value changes.
     */
    @Input() filterOn: string;
    /**
     * This property specifies the type of the input.
     */
    @Input() inputtype: string;
    /**
     * This property specifies how to apply the filter.
     */
    @Input() matchmode: string;
    /**
     * Default value to be set in second widget, when range is selected.
     */
    @Input() maxdefaultvalue: string;
    /**
     * Placeholder to be shown in second widget, when range is selected.
     */
    @Input() maxplaceholder: string;
    /**
     * This property defines the type of validation applied on the form.<br>
     * <p><em>Allowed Values: </em><code>default, html, no validations</code></p>
     * <div class="summary">
     * <p><code>default</code><em>: On form submit, Validation messages will be shown under the form fields.</em></p>
     * <p><code>html</code><em>: On form submit, the HTML and inline validations will be applied.</em></p>
     * <p><code>no validations</code><em>: No validations are performed on form submit.</em></p>
     * </div>
     */
    @Input() validationtype: string = 'default';
}