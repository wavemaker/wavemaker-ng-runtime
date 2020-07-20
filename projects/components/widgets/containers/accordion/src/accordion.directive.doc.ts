import { Input, Directive } from '@angular/core';

/**
 * The wmAccordion directive defines the Accordion widget.
 */
@Directive()
export class Accordion {

    /**
     * Class of the widget.
     */
    @Input() class: string;
    /**
     * Name of the accordion widget.
     */
    @Input() name: string;

    /**
     * This property specifies the tab order of the accordion Widget.
     */
    @Input() tabindex: number = 0;

    /**
     * This property sets the default active accordion pane on load of widget based on provided index. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() defaultpaneindex: number = 0;

    /**
     * This property will be used to show/hide the accordion widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;

    /**
     * This property used to allow multiple accordion panes to be visible parallelly.
     */
    @Input() closeothers: boolean = true;


    /**
     * Callback function which will be triggered when an accordion pane is selected.
     * @param $event  DOM event on which call back is triggered.
     * @param widget  Instance of the accordion widget.
     * @param newPaneIndex  The current selected accordion pane index.
     * @param oldPaneIndex  The previously selected accordion pane index.
     */
    onChange($event: Event, widget: any, newPaneIndex: number, oldPaneIndex: number) {}
}