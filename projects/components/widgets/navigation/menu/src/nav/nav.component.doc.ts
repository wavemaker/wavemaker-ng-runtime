import { Input, Directive } from '@angular/core';

/**
 * The wmNav component defines the Nav widget.
 */
@Directive()
export class Nav {

    /**
     * Class of the widget.
     */
    @Input() class: string;

    /**
     * Name of the Nav.
     */
    @Input() name: string;

    /**
     * This property controls how the nav items are displayed within the Nav <br>
     * <p><em>Allowed Values: </em><code>pills or tabs</code></p>
     * <div class="summary">
     * <p><code>pills</code><em>: Pills styles are applied to nav items </em></p>
     * <p><code>tabs</code><em>: Tabs styles are applied to nav items</em></p>
     * </div>
     */
    @Input() type: string = 'pills';

    /**
     * This property controls how the nav items are displayed within the Nav <br>
     * <p><em>Allowed Values: </em><code>none, stacked, justified</code></p>
     * <div class="summary">
     * <p><code>stacked</code><em>: Nav items are show one above the other.</em></p>
     * <p><code>justified</code><em>: Nav will be occupying full width and each nav item will have equal width.</em></p>
     * </div>
     */
    @Input() layout: string;

    /**
     * Set this property to a data source to construct a nav. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() dataset: Array<any>;

    /**
     * Allows to display the data in asc or desc order based on this property. <br>
     */
    @Input() orderby: string;

    /**
     * Label for the nav item. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() itemlabel: string;

    /**
     * Class for the icon in the nav item. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() itemicon: string;

    /**
     * Link for the nav item. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() itemlink: string;

    /**
     * User role for the nav item. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() userrole: string;

    /**
     * Badge for the nav item.
     */
    @Input() itembadge: string;

    /**
     * Children for the nav item.  <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() itemchildren: string;

    /**
     * This property will be used to show/hide the nav widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;

    /**
     * This property controls how the nav items are displayed within the Nav <br>
     * <p><em>Allowed Values: </em><code>outsideClick, always, disabled</code></p>
     * <div class="summary">
     * <p><code>outsideClick</code><em>: Close the menu when clicked outside of the menu </em></p>
     * <p><code>always</code><em>: When a menu item is selected or on click outside menu</em></p>
     * <p><code>disabled</code><em>: Close only when the menu is clicked.</em></p>
     * </div>
     */
    @Input() autoclose: string = 'outsideClick';

    /**
     * This property specifies how the elements should be aligned horizontally. <br>
     * <p><em>Allowed Values: </em><code>left, center, right</code></p>
     * <div class="summary">
     * <p><code>left</code><em>: Aligns an element to the left.</em></p>
     * <p><code>center</code><em>: Aligns an element to the center.</em></p>
     * <p><code>right</code><em>:  Aligns an element to the right.</em></p>
     * </div>
     */
    @Input() horizontalalign: string;


    /**
     * Callback function which will be triggered when nav item is selected.
     * @param $event  DOM event on which call back is triggered.
     * @param widget  Instance of the nav.
     * @param $item  Nav item object.
     */
    onSelect($event: Event, widget: any, $item: any) {}
}