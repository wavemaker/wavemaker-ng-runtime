import { Input } from '@angular/core';

/**
 * The wmMobileNavbar component defines the mobile navbar widget.
 */


export class MobileNavbar {
    /**
     * backbutton on mobile navbar will be shown if set to true.
     */
    @Input() backbutton: boolean = true;

    /**
     * This property specifies the icon class for backbutton
     */
    @Input() backbuttoniconclass: string = 'wi wi-back';

    /**
     * This property specifies the label for backbutton
     */
    @Input() backbuttonlabel: string;
    /**
    * Class of the widget.
    */
    @Input() class: string;
    /**
     * This property sets the dataValue to be returned by the search inside the navbar when the list is populated using the dataSet property. <br>
     */
    @Input() datafield: string;
    /**
     * This property accepts the options to create the search inside the navbar.
     * These options can be array of values, array of objects, object containing key-value pairs. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() dataset: Array<any> | Object;
    /**
     * This property defines the initial selected value of the search widget. <br>
     * This cannot accept an array of values.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() datavalue: any;
    /**
     * This property specifies the view.
     * <p><em>Allowed Values: </em><code>action-view, search-view</code></p>
     * If set to "search-view", search input will be shown on the mobile navbar.
     * Dataset properties related to search will be populated when switched to search view.
     */
    @Input() defaultview: string = 'action-view';
    /**
     * Picture source sets the image to be displayed in the search results.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() displayimagesrc: string;
    /**
     * This property sets the displayValue to show in the search when the list is populated using the dataSet property. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() displaylabel: string;
    /**
     * This property specifies the source for the brand image. <br>
     */
    @Input() imgsrc: string;
    /**
     * This property contains the entered text in the search input.
     */
    @Input() query: string;
    /**
     * This property specifies the icon class for leftnav panel toggle button.
     */
    @Input() leftnavpaneliconclass: string = 'wi wi-menu';
    /**
     * Name of the mobile navbar widget.
     */
    @Input() name: string;
    /**
     * This property will be used to show/hide the navbar widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;
    /**
     * This property will show leftnav button if set to true
     */
    @Input() showLeftnavbtn: boolean = true;
    /**
     * This is the property to be searched upon, in the list object. This property will be shown when view is set to search-view
     */
    @Input() searchkey: string;
    /**
     * Placeholder shown on the search input when search-view is shown
     */
    @Input() searchplaceholder: string = 'Search';
    /**
     * Title to be displayed on the mobile navbar.
     */
    @Input() title: string;
    /**
     * Callback function which will be triggered when the back button is clicked.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the navbar widget
     */
    onBackbtnclick($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the search query is submitted.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the navbar widget
     */
    onSearch($event: MouseEvent, widget: any) {}
}