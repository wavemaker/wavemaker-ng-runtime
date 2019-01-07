import {Input} from '@angular/core';

/**
 * The wmSpinner component defines spinner widget.
 */

export class Spinner {
    /**
     * This property specifies label of the spinner widget.
     */
    @Input() caption: string = 'Loading...';
    /**
     * Name of the spinner widget.
     */
    @Input() name: string;
    /**
     * This property specifies type of the spinner.
     * <p><em>Allowed Values: </em><code>icon, image</code></p>
     * <div class="summary">
     * <p><code>icon</code><em>: Can set icon as a spinner.</em></p>
     * <p><code>image</code><em>: Can set image as a spinner.</em></p>
     * </div>
     */
    @Input() type: string;
    /**
     * This property allows user to bind service variable for which we want to show loading dialog.
     */
    @Input() servicevariabletotrack: string;
    /**
     * This property specifies whether to show spinner widget or not.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;
    /**
     * This property specifies CSS class of the icon.
     */
    @Input() iconclass: string = 'fa fa-circle-o-notch fa-spin';
    /**
     * This property specifies size of the icon of the icon. Value has to be specified along with the units (em or px).
     */
    @Input() iconsize: string;
    /**
     * Class of the widget.
     */
    @Input() class: string;
    /**
     * This property is to set an image for loading icon.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() image: string;
    /**
     * This property specifies width of an image.
     */
    @Input() imagewidth: string = '20px';
    /**
     * This property specifies height of an image.
     */
    @Input() imageheight: string;
}
