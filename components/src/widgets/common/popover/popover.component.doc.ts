import { Input } from '@angular/core';

/**
 * The wmPopover component defines the popover widget.
 */
export class Popover {
    /**
     * This Property specifies inline value to be displayed along with the label of the popover. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() badgevalue: string;
    /**
     * This property specifies the label of the popover. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() caption: string;
    /**
     * Class of the widget.
     */
    @Input() class: string;
    /**
     * Title/hint for the popover. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() hint: string;
    /**
     * CSS class of the icon.
     */
    @Input() iconclass: string;
    /**
     * url of the icon.
     */
    @Input() iconurl: string;
    /**
     * height of the icon.
     */
    @Input() iconheight: string;
    /**
     * margin of the icon.
     */
    @Input() iconmargin: string;
    /**
     * Property to set the position of icon in the widget.
     * <p><em>Allowed Values: </em><code>left, top, right</code></p>
     * <div class="summary">
     * <p><code>left</code><em>: Positions icon to the left.</em></p>
     * <p><code>top</code><em>: Positions icon on the top.</em></p>
     * <p><code>right</code><em>:  Positions icon to the right.</em></p>
     * </div>
     */
    @Input() iconposition: string;
    /**
     * width of the icon.
     */
    @Input() iconwidth: string;
    /**
     * Name of the popover widget.
     */
    @Input() name: string;
    /**
     * Title of the popover widget.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() title: string;
    /**
     * The shortcut key property specifies a shortcut key to activate/focus an element.
     */
    @Input() shortcutkey: string;
    /**
     * This property will be used to show/hide the popover widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;
    /**
     * This property specifies the tab order of the popover Widget.
     */
    @Input() tabindex: number = 0;
    /**
     * This property defines the width of the popover.
     */
    @Input() popoverwidth: number = 240;
    /**
     * This property defines the height of the popover.
     */
    @Input() popoverheight: number = 360;
    /**
     * Sets content for the popover.<br>
     * <p><em>Allowed Values: </em><code>inline or partial</code></p>
     * <div class="summary">
     * <p><code>inline</code><em>: To drag and drop any widget.</em></p>
     * <p><code>partial</code><em>: To select from available list of partials.</em></p>
     */
    @Input() contentsource: string = 'partial';
    /**
     * Select any partial page or bind anything to the content<br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() content: string;
    /**
     * This property defines which action should trigger popover to open or close.<br>
     * <p><em>Allowed Values: </em><code>click, hover, click and hover</code></p>
     * <div class="summary">
     * <p><code>click</code><em>: To open and close on click.</em></p>
     * <p><code>hover</code><em>: To open and close on hover.</em></p>
     * <p><code>click and hover</code><em>: To open and close on click/hover.</em></p>
     */
    @Input() interaction: string;
    /**
     * This property defines the placement of the popover.<br>
     * <p><em>Allowed Values: </em><code>top, bottom, left and right</code></p>
     * <div class="summary">
     * <p><code>top</code><em>: To place the popover on top.</em></p>
     * <p><code>bottom</code><em>: To place the popover on bottom.</em></p>
     * <p><code>left</code><em>: To place the popover on left.</em></p>
     * <p><code>right</code><em>: To place the popover on right.</em></p>
     */
    @Input() popoverplacement: string = 'Bottom';
    /**
     * This property will be used to encode the provided URL at run time.
     */
    @Input() popoverarrow: boolean = true;
    /**
     * This property will be used to display the arrow on the popover.
     */
    @Input() encodeurl: boolean = false;

    /**
     * This event handler is called when the widget is loaded.
     * @param widget  Instance of the popover widget
     */
    load(widget: any) {}
    /**
     * Callback function which will be triggered when the widget is clicked.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the popover widget
     */
    show($event: Event, widget: any) {}
    /**
     * Callback function which will be triggered when the widget is clicked.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the popover widget
     */
    hide($event: Event, widget: any) {}
}