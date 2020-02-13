import { Input } from '@angular/core';

/**
 * The `wmLivetable` is the Combination of datatable and live form. Using Livetable user can insert,update,delete the data in database wmLivetable can be bound to variables and display the data associated with them.
 */
export class LiveTable {
    /**
     * Class of the widget.
     */
    @Input() class: string;
    /**
     * Name of the data table widget.
     */
    @Input() name: string;
    /**
     * This property will be used to show/hide the table widget on the web page.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean;
    /**
     * This property controls how the form appears.
     * <p><em>Allowed Values: </em><code>inline, dialog</code></p>
     * <div class="summary">
     * <p><code>inline</code><em>: The form is displayed below table</em></p>
     * <p><code>dialog</code><em>: The form is opened in dialog mode.</em></p>
     */
    @Input() formlayout: string = 'inline';
}