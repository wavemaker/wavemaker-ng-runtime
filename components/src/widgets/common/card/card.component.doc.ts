import { Input } from '@angular/core';

/**
 * The wmCard component defines the card widget.
 */

export class Card {
    /**
     * This property sets the the data and events action for the widget.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() actions: string;
    /**
     * Class of the widget.
     */
    @Input() class: string;
    /**
     * CSS class of the icon.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() iconclass: string;
    /**
     * url of the icon.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() iconurl: string;
    /**
     * height of the image.
     */
    @Input() imageheight: string = '200px';
    /**
     * This property specifies the item action for dynamically generated menu items.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() itemaction: string;
    /**
     * This property is to add sub menu items.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() itemchildren: string;
    /**
     * This property specifies label for dynamically generated menu items.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() itemlabel: string;
    /**
     * This property specifies icon for dynamically generated menu items.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() itemicon: string;
    /**
     * This property specifies link for dynamically generated menu items
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() itemlink: string;
    /**
     * Name of the card widget.
     */
    @Input() name: string;
    /**
     * picturesource of the card widget.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() picturesource: string;
    /**
     * Picturetitle of the card widget.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() picturetitle: string;
    /**
     * This property will be used to show/hide the Card widget on the web page.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;
    /**
     * Sub Heading of the card widget.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() subheading: string;
    /**
     * Title of the card widget.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() title: string;
    /**
     * This property specifies the role for dynamically generated menu items.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() userrole: string;

    /**
     * Callback function which will be triggered when the widget is clicked.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the card widget
     * @param item  Data of the card on which click event is triggered
     * @param currentItemWidgets  Widgets inside the card on which click event is triggered
     */
    onClick($event: MouseEvent, widget: any, item: any, currentItemWidgets: any) {}
    /**
     * Callback function which will be triggered when the widget is double clicked.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the card widget
     * @param item  Data of the card on which double click event is triggered
     * @param currentItemWidgets   Widgets inside the card on which double click event is triggered
     */
    onDblclick($event: MouseEvent, widget: any, item: any, currentItemWidgets: any) {}
    /**
     * Callback function which will be triggered when the mouse moves over the card.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the card widget
     * @param item  Data of the card on which mouse over event is triggered
     * @param currentItemWidgets  Widgets inside the card on which mouse over event is triggered
     */
    onMouseover($event: MouseEvent, widget: any, item: any, currentItemWidgets: any) {}
    /**
     * Callback function which will be triggered when the mouse moves away from the card.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the card widget
     * @param item  Data of the card on which mouse out event is triggered
     * @param currentItemWidgets  Widgets inside the card on which mouse out event is triggered
     */
    onMouseout($event: MouseEvent, widget: any, item: any, currentItemWidgets: any) {}
    /**
     * Callback function which will be triggered when the mouse enters the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the card widget
     * @param item  Data of the card on which mouse enter event is triggered
     * @param currentItemWidgets  Widgets inside the card on which mouse enter event is triggered
     */
   onMouseenter($event: MouseEvent, widget: any, item: any, currentItemWidgets: any) {}
    /**
     * Callback function which will be triggered when the mouse leaves the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the card widget
     * @param item  Data of the card on which mouse leave event is triggered
     * @param currentItemWidgets  Widgets inside the card on which mouse leave event is triggered
     */
    onMouseleave($event: MouseEvent, widget: any, item: any, currentItemWidgets: any) {}
    /**
     * Callback function which will be triggered when the tap event is triggered on a widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the card widget
     * @param item  Data of the card on which tap event is triggered
     * @param currentItemWidgets  Widgets inside the card on which tap event is triggered
     */
    onTap($event: TouchEvent, widget: any, item, currentItemWidgets) {}
    /**
     * Callback function which will be triggered when the double tap event is triggered on a widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the card widget
     * @param item  Data of the card on which double tap event is triggered
     * @param currentItemWidgets  Widgets inside the card on which double tap event is triggered
     */
    onDoubletap($event: TouchEvent, widget: any, item, currentItemWidgets) {}

}