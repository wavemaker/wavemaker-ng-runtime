import { Input } from '@angular/core';

/**
 * A menu displays grouped navigation actions. The drop-down menu is typically used inside the navigation header to display a list of related links on a mouse hover or click on the trigger element.
 */

export class Menu {
    /**
     * This property specifies the label of the menu. <br/>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() caption: string = 'Menu';
    /**
     * Name of the menu widget.
     */
    @Input() name: string;
    /**
     * Title/hint for the button. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() hint: string;
    /**
     * This property specifies the tab order of the Button Widget.
     */
    @Input() tabindex: number = 0;
    /**
     * The shortcut key property specifies a shortcut key to activate/focus an element.
     */
    @Input() shortcutkey: string;
    /**
     * This property specifies layout of menu widget. <br>
     * <p><em>Allowed Values: </em><code>Vertical, Horizontal</code></p>
     * <div class="summary">
     * <p><code>Vertical</code><em>: Arrange menu items vertically.</em></p>
     * <p><code>Horizontal</code><em>: Arrange menu items horizontally.</em></p>
     * </div>
     */
    @Input() menulayout: string;
    /**
     * This property sepcifies the position of menu item. <br>
     * <p><em>Allowed Values: </em><code>'down,right', 'down,left', 'up,right', 'up,left', 'inline'</code></p>
     */
    @Input() menuposition: string;
    /**
     * Set this property to a variable to populate the list of values to display.
     */
    @Input() dataset: any = 'Menu Item 1, Menu Item 2, Menu Item 3';
    /**
     * This Property allows user for multiple selection for ordering the display of rows based on fields in ascending or descending order.
     */
    @Input() orderby: string;
    /**
     * This property specifies the item action for dynamically generated menu items.
     */
    @Input() itemaction: string;
    /**
     * This property specifies the role for dynamically generated menu items.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() userrole: string;
    /**
     * This property will be used to show/hide the Menu widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;
    /**
     * This property specifies the context in which linked resources is open. <br>
     * <p><em>Allowed Values: </em><code>_blank, _parent, _self, _top</code></p>
     * <div class="summary">
     * <p><code>_blank</code><em>: Opens the linked document in a new window or tab.</em></p>
     * <p><code>_parent</code><em>: Opens the linked document in the parent frame.</em></p>
     * <p><code>_self</code><em>: Opens the linked document in the same frame as it was clicked (this is default) .</em></p>
     * <p><code>_top</code><em>: Opens the linked document in the full body of the window.</em></p>
     * </div>
     */
    @Input() linktarget: string;
    /**
     * This property controls the behaviour of menu when clicked.
     * <p><em>Allowed Values: </em><code>always, outsideClick, disabled</code></p>
     * <div class="summary">
     * <p><code>always</code><em>: Closes when any of the item is selected.</em></p>
     * <p><code>outsideClick</code><em>: Closes when clicked outside the menu.</em></p>
     * <p><code>disabled</code><em>: Disabled auto-close.</em></p>
     * </div>
     */
    @Input() autoclose: string = 'always';
    /**
     * This property specifies the animation of an inner items. The animation is based on the css classes. <br>
     * <p><em>Allowed Values: </em><code>slide, fade, scale</code></p>
     * <div class="summary">
     * <p><code>slide</code><em>: Inner items will have slide animation.</em></p>
     * <p><code>fade</code><em>: Inner items will have fade animation.</em></p>
     * <p><code>scale</code><em>: Inner items will have scale animation.</em></p>
     * </div>
     */
    @Input() animateitems: string;
    /**
     * CSS class of the icon.
     */
    @Input() iconclass: string;
    /**
     * Class of the widget.
     */
    @Input() class: string;
    /**
     * This property is to add sub menu items.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() itemchildren: string;
    /**
     * This property specifies icon for dynamically generated menu items.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() itemicon: string;
    /**
     * This property specifies label for dynamically generated menu items.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() itemlabel: string;
    /**
     * This property specifies link for dynamically generated menu items
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() itemlink: string;
    /**
     * This property specifies class of the menu.
     */
    @Input() menuclass: string;
    /**
     * Callback function which will be triggered when the Menu item is selected.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the button widget
     * @param $item   which provides selected menu item details
     */
    select ($event: MouseEvent, widget: any, $item: any) {}

}