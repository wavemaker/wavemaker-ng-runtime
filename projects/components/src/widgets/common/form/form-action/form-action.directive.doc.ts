import { Input } from '@angular/core';

/**
 * The wmFormAction component defines the form action widget.
 */
export class FormAction {
    /**
     * CSS class for styling the field.
     */
    @Input() class: string;
    /**
     * Name of the form action widget.
     */
    @Input() name: string;
    /**
     * Title of the form action widget.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() title: string;
    /**
     * Icon Class for the form action button.
     */
    @Input() iconclass: string;
    /**
     * Icon Name for the actions.
     */
    @Input() iconname: string;
    /**
     * The action to invoke when clicked.
     */
    @Input() action: string;
    /**
     * This property determines the position at which actions column has to be rendered.
     * <p><em>Allowed Values: </em><code>footer, header</code></p>
     * <div class="summary">
     * <p><code>footer</code><em>: To add button actions on the footer.</em></p>
     * <p><code>header</code><em>: To add button actions on the header.</em></p>
     * </div>
     */
    @Input() position: string = 'footer';
    /**
     * The shortcut key property specifies a shortcut key to activate/focus an element.
     */
    @Input() shortcutkey: string;
    /**
     * This property will be used to show/hide the form action widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;
    /**
     * This property specifies the tab order of the form action.
     */
    @Input() tabindex: number = 0;
    /**
     * Type of the button widget. <br>
     * <p><em>Allowed Values: </em><code>button, submit, reset</code></p>
     * <div class="summary">
     * <p><code>button</code><em>: Just a button.</em></p>
     * <p><code>reset</code><em>: Resets data in the current form.</em></p>
     * <p><code>submit</code><em>:  Submits the current form data.</em></p>
     * </div>
     */
    @Input() type: string;
    /**
     * This property will be used to disable/enable the form action on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() disabled: boolean;
}