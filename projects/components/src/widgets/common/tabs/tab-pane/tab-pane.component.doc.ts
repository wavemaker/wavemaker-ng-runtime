import { Input } from '@angular/core';

/**
 * The wmTabPane component defines the tabpane widget.
 */
export class TabPane {

    /**
     * Class of the widget.
     */
    @Input() class: string;

    /**
     * Name of the tabpane widget.
     */
    @Input() name: string;

    /**
     * Title of the tabpane widget.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() title: string = 'Tab Title';

    /**
     * This property specifies the value to be displayed along with the pane title.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() badgevalue: string;

    /**
     * This property controls the state of the badge.
     * <p><em>Bindable: </em><code>true</code></p>
     * <p><em>Allowed Values: </em><code>default, primary, success, info, warning, danger</code></p>
     */
    @Input() badgetype: string = 'default';

    /**
     * This property specifies the tab order of the tabpane widget.
     */
    @Input() tabindex: number = 0;

    /**
     * Html or Partial content of the widget.
     * <p><em>Bindable: </em><code>true</code></p>
     * <p><em>Allowed Values: </em><code>Inline Content, Partials</code></p>
     */
    @Input() content: string = 'Inline Content';

    /**
     * This property will be used to show/hide the tab pane on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;

    /**
     * If the disabled property is true (checked) the value of the editor cannot change. The widget becomes display-only. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() disabled: boolean = false;

    /**
     * Icon which we displayed on the tab-header. <br>
     * This is will be used only when the default template is used.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() paneicon: string;

    /**
     * Callback function which will be triggered when tab pane is loaded.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the tab pane widget
     */
    onLoad($event: Event, widget: any) {}


    /**
     * Callback function which will be triggered when a tab pane is selected.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the tab pane widget
     */
    onSelect($event: Event, widget: any) {}


    /**
     * Callback function which will be triggered when a tab pane is deselected.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the tab pane widget
     */
    onDeselect($event: Event, widget: any) {}
}