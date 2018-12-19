import { Input } from '@angular/core';

/**
 * The wmBreadcrumb component defines the Breadcrumb widget.
 */
export class Breadcrumb {

    /**
     * Class of the widget.
     */
    @Input() class: string;
    /**
     * Name of the Breadcrumb.
     */
    @Input() name: string;

    /**
     * Set this property to a data source to construct the breadcrumb. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() dataset: any;

    /**
     * This property should be the mapped to the page name so that the breadcrumb path is generated when the page is loaded. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() itemid: string;

    /**
     * Label for the breadcrumb item. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() itemlabel: string;

    /**
     * Class for the icon in the breadcrumb item. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() itemicon: string;

    /**
     * Link for the breadcrumb item. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() itemlink: string;

    /**
     * Children for the breadcrumb item.  <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() itemchildren: string;

    /**
     * This property will be used to show/hide the breadcrumb widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;

    /**
     * Callback function is triggered before the page is redirected.
     * @param widget  Instance of the breadcrumb widget.
     * @param $item  The object used to construct the clicked item.
     */
    onBeforenavigate(widget: any, $item: any) {}
}
