import { Input, Directive } from '@angular/core';

/**
 * The wmIframe component defines the iframe widget.
 */
@Directive()
export class Iframe {
    /**
     * Class of the widget.
     */
    @Input() class: string;
    /**
     * This property helps to encode the provided URL at run time.
     */
    @Input() encodeurl: boolean;
    /**
     * External URL that needs to be embedded within the iframe.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() iframesrc: string;
    /**
     * Name of the iframe widget.
     */
    @Input() name: string;
    /**
     * This property will be used to show/hide the iframe widget on the web page.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;
}