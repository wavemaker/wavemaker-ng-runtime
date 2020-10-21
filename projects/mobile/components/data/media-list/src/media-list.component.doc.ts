import { Input } from '@angular/core';

/**
 * The wmMediaList component defines the MediaList widget.
 */

export class MediaList {

    /**
     * Class of the widget.
     */
    @Input() class: string;

    /**
     * Set this property to a variable to populate the list of values to display.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() dataset: Array<any> | Object;

    /**
     * Name of the Media list.
     */
    @Input() name: string;

    /**
     * This property controls how contained widgets are displayed within this widget container. <br>
     * <p><em>Allowed Values: </em><code>Single-row, Multi-row</code></p>
     * <div class="summary">
     * <p><code>Single-row</code><em>: Displays elements in a single row.</em></p>
     * <p><code>Multi-row</code><em>: Displays elements in multiple rows.</em></p>
     */
    @Input() layout: string = 'Single-row';

    /**
     * This property will be used to show/hide the media list widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;
    /**
     * If checked, then picture is saved for offline display.
     */
    @Input() offline: boolean = true;

    /**
     * This contains the url for the picture’s thumbnail.
     */
    @Input() thumbnailurl: string;
    /**
     * This contains the url for the picture.
     */
    @Input() mediaurl: string;
}