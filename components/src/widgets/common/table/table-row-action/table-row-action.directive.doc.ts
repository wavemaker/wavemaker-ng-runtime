import { Input } from '@angular/core';

/**
 * The wmTableRowAction component defines the table row action widget.
 */
export class TableRowAction {
    /**
     * CSS class for styling the field.
     */
    @Input() class: string;
    /**
     * Name of the table row action widget.
     */
    @Input() name: string;
    /**
     * title of the table row action widget.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() title: string;
    /**
     * Icon Class for the action button.
     */
    @Input() iconclass: string;
    /**
     * The action to invoke when clicked.
     */
    @Input() action: string;
    /**
     * The shortcut key property specifies a shortcut key to activate/focus an element.
     */
    @Input() shortcutkey: string;
    /**
     * This property will be used to show/hide the button widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;
    /**
     * This property specifies the tab order of the Button Widget.
     */
    @Input() tabindex: number = 0;
    /**
     * This property will be used to disable/enable the button widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() disabled: boolean;
}