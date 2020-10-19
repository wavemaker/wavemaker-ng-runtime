import { Input, Directive } from '@angular/core';

/**
 * The wmIcon component defines the icon widget.
 */
@Directive()
export class Icon {
    /**
     * This property specifies the label of the icon. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() caption: string;
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
     * Hint text is shown for the icon widget on hover. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() hint: string;
    /**
     * CSS class of the icon.
     */
    @Input() iconclass: string = 'wi wi-star-border';
    /**
     * url of the icon.
     */
    @Input() iconurl: string;
    /**
     * Property to set the position of icon in the widget.
     * <p><em>Allowed Values: </em><code>left, right</code></p>
     * <div class="summary">
     * <p><code>left</code><em>: Sets the position of icon to left</em></p>
     * <p><code>right</code><em>: Sets the position of icon to right</em></p>
     * </div>
     */
    @Input() iconposition: string = 'left';
    /**
     * width of the icon.
     */
    @Input() iconwidth: string;
    /**
     * Name of the icon widget.
     */
    @Input() name: string;
    /**
     * This property will be used to show/hide the icon widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;
}