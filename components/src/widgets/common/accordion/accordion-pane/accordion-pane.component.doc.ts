import { Input } from '@angular/core';

/**
 * The wmAccordionPane component defines the accordion pane.
 */
export class AccordionPane {

    /**
     * Class of the widget.
     */
    @Input() class: string;

    /**
     * Title of the accordion pane. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() title: string = 'Title';

    /**
     * Subheading of the accordion pane. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() subheading: string;

    /**
     * Name of the accordion pane.
     */
    @Input() name: string;

    /**
     * This Property specifies inline value to be displayed on the pane title. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() badgevalue: string;

    /**
     * The property controls the color of the badge. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     * <p><em>Allowed Values: </em><code>default, primary, success, info, warning, danger</code></p>
     */
    @Input() badgetype: string = 'default';

    /**
     * This property specifies the tab order of the accordion pane.
     */
    @Input() tabindex: number = 0;

    /**
     * Sets content for the accordion pane. <br>
     * <p><em>Allowed Values: </em><code>Inline Content or partials</code></p>
     * <div class="summary">
     * <p><code>Inline Content</code><em>: To drag and drop any widget.</em></p>
     * <p><code>Partials</code><em>: To select from available list of partials.</em></p>
     */
    @Input() content: string = 'Inline Content';

    /**
     * This property will be used to show/hide the accordion pane on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;

    /**
     * Callback function which will be triggered when the accordion pane is loaded.
     * @param widget  Instance of the accordion pane.
     */
    load(widget: any) {}

    /**
     * Callback function which will be triggered when the accordion pane is expanded.
     * @param $event  DOM event on which call back is triggered.
     * @param widget  Instance of the accordion pane.
     */
    expand($event: Event, widget: any) {}

    /**
     * Callback function which will be triggered when the widget is collapsed.
     * @param $event  DOM event on which call back is triggered.
     * @param widget  Instance of the accordion pane.
     */
    collapse($event: Event, widget: any) {}
}