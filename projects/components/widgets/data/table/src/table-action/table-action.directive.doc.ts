import { Input } from '@angular/core';

/**
 * The wmTableAction component defines the table action widget.
 */

export class TableAction {
    /**
     * CSS class for styling the field.
     */
    @Input() class: string;
    /**
     * Name of the table action widget.
     */
    @Input() name: string;
    /**
     * This property specifies the label of the button/anchor. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() caption: string;
    /**
     * title of the table action widget.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() title: string;
    /**
     * Icon Class for the table action widget.
     */
    @Input() iconclass: string;
    /**
     * The action to invoke when clicked.
     */
    @Input() action: string;
    /**
     * This property determines the position at which actions widget has to be rendered within the Data Table
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
     * This property will be used to show/hide the table action widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;
    /**
     * This property specifies the tab order of the table action.
     */
    @Input() tabindex: number = 0;
    /**
     * Type of the widget to add. <br>
     * <p><em>Allowed Values: </em><code>anchor, button</code></p>
     * <div class="summary">
     * <p><code>anchor</code><em>: Adds an anchor widget.</em></p>
     * <p><code>button</code><em>: Adds a button widget.</em></p>
     * </div>
     */
    @Input() widgetType: string = 'button';
    /**
     * Opening of the linked document depends on this property. <br>
     * <p><em>Allowed Values: </em><code>_blank, _parent, _self, _top</code></p>
     * <div class="summary">
     * <p><code>_blank</code><em>: Opens the linked document in a new window or tab.</em></p>
     * <p><code>_parent</code><em>: Opens the linked document in the same frame as it was clicked (this is default).</em></p>
     * <p><code>_self</code><em>: Opens the linked document in the parent frame.</em></p>
     * <p><code>_top</code><em>: Opens the linked document in the full body of the window.</em></p>
     * </div>
     */
    @Input() target: string;
    /**
     * This property will be used to disable/enable the table action on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() disabled: boolean;
    /**
     * The web url you want to redirect to on clicking the action widget.
     */
    @Input() hyperlink: string;
}