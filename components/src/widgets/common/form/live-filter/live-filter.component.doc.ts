import { Input } from '@angular/core';

/**
 * The wmLivefilter widget defines a live filter in the layout.
 */
export class LiveFilter {
    /**
     * Enabling this property turns on auto-completion in the editor. As the user types the choices in the drop-down select editor change dynamically.
     */
    @Input() autocomplete: boolean = false;
    /**
     * Defines the alignment of the caption elements of widgets inside the form.
     * <p><em>Allowed Values: </em><code>left, center, right</code></p>
     * <div class="summary">
     * <p><code>left</code><em>: Caption is aligned to left.</em></p>
     * <p><code>center</code><em>: Caption is aligned in center.</em></p>
     * <p><code>right</code><em>: Caption is aligned to right.</em></p>
     */
    @Input() captionalign: string = 'left';
    /**
     * Defines the position of the caption elements of widgets inside the form.
     * <p><em>Allowed Values: </em><code>left, top, right</code></p>
     * <div class="summary">
     * <p><code>left</code><em>: Caption is positioned to left of form widget.</em></p>
     * <p><code>top</code><em>: Caption is positioned on top of form widget.</em></p>
     * <p><code>right</code><em>: Caption is positioned to right of form widget.</em></p>
     */
    @Input() captionposition: string = 'left';
    /**
     * Accepts integer(x) between 1-12 and adds class col-xs-(x) for mobile, col-sm-(x) for Tablet Potrait, col-md-(x) for Laptop Tablet Landscape , col-lg-(x) for Large screen to suit bootstrap fluid grid system.
     */
    @Input() captionwidth: string = 'xs-12 sm-3 md-3 lg-3';
    /**
     * Class of the widget.
     */
    @Input() class: string;
    /**
     * Enable control for collapsing and expanding the widget.
     */
    @Input() collapsible: boolean = false;
    /**
     * This property specifies the datasource to which values of form are submitted.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() dataset: any;
    /**
     * Set the default state of the form whether it is expanded or collapsed.
     */
    @Input() expanded: boolean = false;
    /**
     * CSS class of the icon showed in form header.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() iconclass: string = 'wi wi-filter-list';
    /**
     * Name of the Live Filter widget.
     */
    @Input() name: string;
    /**
     * This property will be used to show/hide the live filter widget on the web page.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean;
    /**
     * This property defines the sub heading or title for the widget.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() subheading: string;
    /**
     * This property specifies the tab order of the Live Filter Widget.
     */
    @Input() tabindex: number = 0;
    /**
     * Title of the Live Filter.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() title: string;
    /**
     * Set this property to true, if you want to trigger the filter automatically on change of any input field inside the live filter.
     */
    @Input() autoupdate: boolean = false;
    /**
     * This property enables 'No Value' option for select and radioset widgets in Live Filter. 'No Value' option can be used for filtering null or empty records.
     * <p><em>Allowed Values: </em><code>NULL, EMPTY, NULL AND EMPTY</code></p>
     * <div class="summary">
     * <p><code>NULL</code><em>:Filtering on 'No Value' returns null records.</em></p>
     * <p><code>EMPTY</code><em>: Filtering on 'No Value' returns empty records.</em></p>
     * <p><code>NULL AND EMPTY</code><em>: Filtering on 'No Value' returns both null and empty records.</em></p>
     */
    @Input() enableemptyfilter: string;
    /**
     * This property sets the number of records to be fetched by the live filter
     */
    @Input() pagesize: number = 20;

    /**
     * Callback is triggered on save of form and before sending service call. This callback can be used to validate or modify data.
     * @param $data Input data collected from the filter widget
     * @returns if the callback returns false, filter call is stopped. Anything else, filter call continues with modified data.
     */
    onBeforeservicecall($data: any): void | boolean {}
    /**
     * This event handler is called whenever the filter call is success.
     * @param $data response returned from the service call
     */
    onSuccess($data: any) {}
    /**
     * This event handler is called whenever the filter call returns an error.
     * @param $data response returned from the service call
     */
    onError($data: any) {}


    /**
     * This method is used to trigger the filter call.
     */
    filter() {}
    /**
     * This method is used to clear the filter values and trigger the filter call.
     */
    clearFilter() {}
}