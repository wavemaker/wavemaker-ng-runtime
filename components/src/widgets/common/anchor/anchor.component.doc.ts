import { Input } from '@angular/core';

/**
 * The wmAnchor component defines the anchor widget.
 */
export class Anchor {
    /**
     * This Property specifies inline value to be displayed along with the label of the anchor. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() badgevalue: string;
    /**
     * This property specifies the label of the anchor. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() caption: string;
    /**
     * Class of the widget.
     */
    @Input() class: string = 'app-anchor';
    /**
     * This property allows user to bind expression to class property.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() conditionalclass: string;
    /**
     * This property will be used to set the web url to redirect for anchor on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() hyperlink: string;
    /**
     * This property will be used to set the behavior of the anchor link on click. <br>
     * <p><em>Allowed Values: </em><code>_blank, _self, _parent, _top</code></p>
     * <div class="summary">
     * <p><code>_blank: </code><em>Opens link in the same frame</em></p>
     * <p><code>_parent: </code><em>Opens link in a parent frame</em></p>
     * <p><code>_top: </code><em>Opens link in the full body of the window</em></p>
     * </div>
     */
    @Input() target: string;
    /**
     * This property will enable the provided URL to be encoded at run time.
     */
    @Input() encodeurl: boolean;
    /**
     * Title/hint for the anchor. <br>
     * <p><em>Bindable: </em><code>false</code></p>
     */
    @Input() hint: string;
    /**
     * CSS class of the icon.
     */
    @Input() iconclass: string;
    /**
     * Url of the icon.
     */
    @Input() iconurl: string;
    /**
     * Height of the icon.
     */
    @Input() iconheight: string;
    /**
     * Margin of the icon.
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
     * Width of the icon.
     */
    @Input() iconwidth: string;
    /**
     * Name of the anchor widget.
     */
    @Input() name: string;
    /**
     * The shortcut key property specifies a shortcut key to activate/focus an element.
     */
    @Input() shortcutkey: string;
    /**
     * This property will be used to show/hide the anchor widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;
    /**
     * This property specifies the tab order of the Anchor Widget.
     */
    @Input() tabindex: number = 0;

    /**
     * Callback function which will be triggered when the widget loses focus.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the anchor widget
     */
    blur($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget is clicked.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the anchor widget
     */
    click($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget is double clicked.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the anchor widget
     */
    dblclick($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget gets focused.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the anchor widget
     */
    focus($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the mouse enters the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the anchor widget
     */
    mouseenter($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the mouse leaves the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the anchor widget
     */
    mouseleave($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered the tap event is triggered on a widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the anchor widget
     */
    tap($event: TouchEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the double tap event is triggered on a widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the anchor widget
     */
    doubletap($event: TouchEvent, widget: any) {}
}