import { Input } from '@angular/core';

/**
 * The wmNavbar component defines the nav bar widget.
 */
export class Navbar {

    /**
     * Name of the navbar widget.
     */
    @Input() name: string;

    /**
     * Class of the widget.
     */
    @Input() class: string;

    /**
     * Title of the navbar. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() title: string;

    /**
     * This property will be used to show/hide the navbar widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;

    /**
     * This property specifies the url for the home link.
     * <p><em>Default Value: </em> Redirects to home page if no link is given.</p>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() homelink: string;

    /**
     * CSS class of the icon.
     */
    @Input() menuiconclass: string = 'wi wi-more-vert';

    /**
     * This property specifies the source for the brand image. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() imgsrc: string;

}