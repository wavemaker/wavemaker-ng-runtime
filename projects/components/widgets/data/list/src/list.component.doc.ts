import { Input } from '@angular/core';

/**
 * The wmList component defines the list widget.
 */

export class List {

    /**
     * Class of the widget.
     */
    @Input() class: string;

    /**
     * Enable control for collapsing and expanding the widget when groupby property is set.
     */
    @Input() collapsible: boolean = false;

    /**
     * This property determines the date format to be applied on the group heading
     */
    @Input() dateformat: string;

    /**
     * Set this property to a variable to populate the list of values to display.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() dataset: Array<any> | Object;

    /**
     * If the disable selection property is true (checked), selection of List item will not be allowed.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() disableitem: boolean = false;

    /**
     * This property will allow users to reorder the list items if set to true. <br>
     */
    @Input() enablereorder: boolean = false;

    /**
     * This property allows for grouping the list of rows in the variable bound to a dataset by selecting one of the field names from the drop-down list.
     */
    @Input() groupby: string;

    /**
     * CSS class of the icon. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() iconclass: string;

    /**
     * This property allows user to select a pre-defined list item class name from the view-list drop down.
     * <p><em>Default Options: </em><code>list-group-item, media</code></p>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() itemclass: string = 'list-group-item';

    /**
     * This property controls the number of list items that are displayed within each row of the list.
     */
    @Input() itemsperrow: string;

    /**
     * This property allows user to select a pre-defined list item class name from the view-list drop down.
     * <p><em>Default Options: </em><code>list-group, media-list</code></p>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() listclass: string = 'list-group';

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
     * On checking this property users can select multiple items in list.
     */
    @Input() multiselect: boolean = false;

    /**
     * This message will be displayed when waiting for data to load.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() loadingdatamsg: string = 'Loading...';

    /**
     * This property can be used to set an icon to be shown while loading records.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() loadingicon: string = 'fa fa-circle-o-notch';

    /**
     * When "Group as" property is set to
     * 1. alphabetic, the group heading will contain the starting character of the grouped data key
     * 2. word, the group heading will contain the word.
     * 3. any of the TIME options, data is grouped based on the time option given
     */
    @Input() match: string;

    /**
     * Maximum number of items to be displayed in the list.
     */
    @Input() maxsize: number;

    /**
     * Name of the list widget.
     */
    @Input() name: string;
    /**
     * Select the pagination type for the widget.
     * <p><em>Allowed Values: </em><code>Basic, Pager, Classic, Scroll, Inline, None, On-Demand</code></p>
     * <div class="summary">
     * <p><code>Basic</code><em>: This option gives a next and previous arrow along with the page numbers at the bottom of the page.</em></p>
     * <p><code>Pager</code><em>: This option gives a next and previous buttons at the bottom of the page for pagination.</em></p>
     * <p><code>Classic</code><em>: A bar with total number of pages and number of items in the current page will be displayed, along with arrows for pagination.</em></p>
     * <p><code>Scroll</code><em>: On the scroll over the list will cause the next page to load and display.</em></p>
     * <p><code>Inline</code><em>: This option gives a next and previous arrows at both the sides of the page for pagination, carousel style.</em></p>
     * <p><code>None</code><em>: No pagination will be provided.</em></p>
     * <p><code>On-Demand</code><em>: List items loads on demand by clicking on the "load more" button.</em></p>
     */
    @Input() navigation: string = 'Basic';

    /**
     * This property specifies how the paginator should be aligned horizontally.
     * <p><em>Allowed Values: </em><code>left, center, right</code></p>
     * <div class="summary">
     * <p><code>left</code><em>: Aligns paginator to the left.</em></p>
     * <p><code>center</code><em>: Aligns paginator to the center.</em></p>
     * <p><code>right</code><em>:  Aligns paginator to the right.</em></p>
     * </div>
     */
    @Input() navigationalign: string = 'left';

    /**
     * This message will be displayed when there is no data to display.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() nodatamessage: string = 'No data found.';

    /**
     * The property can be used to customize the on demand navigation message.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() ondemandmessage: string = 'Load More';

    /**
     * Allows to display the data in asc or desc order based on this property.
     */
    @Input() orderby: string;

    /**
     * This property allows user style pagination class.
     */
    @Input() paginationclass: string;

    /**
     * This property sets the maximum number of items to display on each page of the list.
     */
    @Input() pagesize: number = 20;

    /**
     * If this property is enabled, the first item of the list will be selected automatically when the livelist is displayed.<br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() selectfirstitem: boolean = false;

    /**
     * This property will allow users to select only a limited number of items.<br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() selectionlimit: number;

    /**
     * This property will be used to show/hide the list widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;

    /**
     * Count of list items in list group will be shown, if set to true
     */
    @Input() showcount: boolean = false;

    /**
     * This property controls whether the total record count is displayed in the data paginator or not.
     */
    @Input() showrecordcount: boolean = false;

    /**
     * Subheading of the list widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() subheading: string;

    /**
     * This property specifies the tab order of the list widget.
     */
    @Input() tabindex: number = 0;

    /**
     * Tile of the list widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() title: string;

    /**
     * Callback function which will be triggered when the list item is clicked.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the list widget
     */
    onClick($event: MouseEvent, widget: any) {}

    /**
     * Callback function which will be triggered when the list item is double clicked.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the list widget
     */
    onDblclick($event: MouseEvent, widget: any) {}

    /**
     * Callback function which will be triggered when the mouse enters the list item.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the list widget
     */
   onMouseenter($event: MouseEvent, widget: any) {}

    /**
     * Callback function which will be triggered when the mouse leaves the list item.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the list widget
     */
    onMouseleave($event: MouseEvent, widget: any) {}

    /**
     * Callback function which will be triggered when the tap event is triggered on a list item.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the list widget
     */
    onTap($event: TouchEvent, widget: any) {}

    /**
     * Callback function which will be triggered when the double tap event is triggered on a list item.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the list widget
     */
    onDoubletap($event: TouchEvent, widget: any) {}

    /**
     * Callback function which will be triggered whenever a key is pressed when a list item is focused.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the list widget
     */
    onKeypress($event: KeyboardEvent, widget: any) {}

    /**
     * Callback function which will be triggered before the item in a list is reordered.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the list widget
     * @param $data Contains the list data with reordered list.
     * @param $changedItem List item that is reordered.
     */
    onReorder($event: MouseEvent, widget: any, $data: Array<any>, $changedItem: Object) {}

    /**
     * Callback function which will be triggered when the items selected cross the specified Selection Limit.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the list widget
     */
    onSelectionlimitexceed($event: Event, widget: any) {}

    /**
     * This event handler is called before the list items are rendered on the list widget.
     * @param widget Instance of the list widget
     * @param $data Contains the new list data
     */
    onBeforedatarender(widget: any, $data: Array<any>) {}

    /**
     * This event handler is called when the page is changed through navigation controls.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the list widget
     * @param $index  Current page
     */
    onPaginationonChange($event: Event, widget: any, $index: number) {}

    /**
     * This event handler is called when the data is set using the pagination.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the list widget
     * @param $index  Current page
     * @param $data  Contains the new set of data.
     */
    onSetrecord($event: Event, widget: any, $index: number, $data: Array<any>) {}

    /**
     * Clear method removes all the list items for the list widget.
     */
    clear() {}

    /**
     * This method allows to select a list item in the list widget.
     * @param index Can be an Index(integer) or Model (Object)
     */
    selectItem(index: number | Object) {}

    /**
     * This method allows to deselect a list item in the list widget.
     * @param index Can be an Index(integer) or Model (Object)
     */
    deselectItem(index: number | Object) {}

    /**
     * This method returns the widget at particular index in the list.
     * @param widgetName Name of the widget.
     * @param index The index of the item in the List.
     */
    getWidgets(widgetName: number, index: number) {}
}
