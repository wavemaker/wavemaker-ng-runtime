import { Input } from '@angular/core';

/**
 * The wmPanel component defines the Panel widget.
 */

export class Panel {

    /**
     * Class of the widget.
     */
    @Input() class: string;

    /**
     * This property allows user to bind expression to class property.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() conditionalclass: string;

    /**
     * Title of the panel. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() title: string = 'Title';

    /**
     * Subheading of the panel. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() subheading: string;

    /**
     * Name of the Panel.
     */
    @Input() name: string;

    /**
     * This property specifies the value to be displayed on the panel title. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() badgevalue: string;

    /**
     * The property controls the state of the badge. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     * <p><em>Allowed Values: </em><code>default, primary, success, info, warning, danger</code></p>
     */
    @Input() badgetype: string = 'default';

    /**
     * If this property has a value, a "?" icon is added next to your editor. <br>
     * If the user points the mouse at this icon, the text you put into this helpText property will popup for the user. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() helptext: string;

    /**
     * Sets content for the panel. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     * <p><em>Allowed Values: </em><code>Inline Content or partials</code></p>
     * <div class="summary">
     * <p><code>Inline Content</code><em>: To drag and drop any widget.</em></p>
     * <p><code>Partials</code><em>: To select from available list of partials.</em></p>
     */
    @Input() content: string = 'Inline Content';

    /**
     * Set this property to a data source to construct the menu on the panel header. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() actions: Array<any>;

    /**
     * Label for the dropdown menu item. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() itemlabel: string;

    /**
     * Class for the icon in the dropdown menu item. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() itemicon: string;

    /**
     * Link for the dropdown menu item. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() itemlink: string;

    /**
     * User role for the dropdown menu item. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() userrole: string;

    /**
     * Children for the dropdown menu item.  <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() itemchildren: string;

    /**
     * This property will be used to show/hide the panel widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;

    /**
     * This property will enable control for collapsing and expanding the panel.
     */
    @Input() collapsible: boolean = false;

    /**
     * This property will enable control for making the panel full screen.
     */
    @Input() enablefullscreen: boolean = false;

    /**
     * This property allows user to access close action from panel header as well as enables close through ESC key press.
     */
    @Input() closable: boolean = false;

    /**
     * This property will set the default state of the panel as expanded or collapsed.
     */
    @Input() expanded: boolean = true;

    /**
     * This property defines the class of the icon that is shown in the header of the panel. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() iconclass: string = 'wi wi-account-circle';

    /**
     * Url of the icon. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() iconurl: string;

    /**
     * width of the icon.
     */
    @Input() iconwidth: string;

    /**
     * height of the icon.
     */
    @Input() iconheight: string;

    /**
     * Margin of the icon.
     */
    @Input() iconmargin: string;

    /**
     * Callback function which will be triggered when the panel content is loaded.
     * @param widget  Instance of the panel.
     */
    onLoad(widget: any) {}


    /**
     * Callback function which will be triggered when the mouse hovers over the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the panel
     */
    onMouseover($event: MouseEvent, widget: any) {}

    /**
     * Callback function which will be triggered when the mouse moves away from this widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the panel
     */
    onMouseout($event: MouseEvent, widget: any) {}

    /**
     * Callback function which will be triggered when the mouse enters the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the panel
     */
   onMouseenter($event: MouseEvent, widget: any) {}

    /**
     * Callback function which will be triggered when the mouse leaves the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the panel
     */
    onMouseleave($event: MouseEvent, widget: any) {}


    /**
     * Callback function which will be triggered when the widget is swiped up.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the panel
     */
    onSwipeup($event: TouchEvent, widget: any) {}

    /**
     * Callback function which will be triggered when the widget is swiped down.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the panel
     */
    onSwipedown($event: TouchEvent, widget: any) {}

    /**
     * Callback function which will be triggered when the widget is swiped right.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the panel
     */
    onSwiperight($event: TouchEvent, widget: any) {}

    /**
     * Callback function which will be triggered when the widget is swiped left.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the panel
     */
    onSwipeleft($event: TouchEvent, widget: any) {}

    /**
     * Callback function which will be triggered when a pinchin event is triggered.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the panel
     */
    onPinchin($event: TouchEvent, widget: any) {}

    /**
     * Callback function which will be triggered when a pinchout event is triggered.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the panel
     */
    onPinchout($event: TouchEvent, widget: any) {}


    /**
     * Callback function which will be triggered when panel is closed.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the panel.
     */
    onClose($event: Event, widget: any) {}

    /**
     * Callback function which will be triggered when the panel is expanded.
     * @param $event  DOM event on which call back is triggered.
     * @param widget  Instance of the panel.
     */
    onExpand($event: Event, widget: any) {}

    /**
     * Callback function which will be triggered when the panel is collapsed.
     * @param $event  DOM event on which call back is triggered.
     * @param widget  Instance of the panel.
     */
    onCollapse($event: Event, widget: any) {}

    /**
     * Callback function is called when the actions item is clicked.
     * @param $item  The object used to construct the clicked dropdown item.
     */
    onActionsclick($item: any) {}

    /**
     * Callback function is called on the full screen state of the panel.
     * @param $event  DOM event on which call back is triggered.
     * @param widget  Instance of the panel.
     */
    onFullscreen($event: Event, widget: any) {}

    /**
     * Callback function is called on the exit from full screen mode of the panel.
     * @param $event  DOM event on which call back is triggered.
     * @param widget  Instance of the panel.
     */
    onExitfullscreen($event: Event, widget: any) {}
}