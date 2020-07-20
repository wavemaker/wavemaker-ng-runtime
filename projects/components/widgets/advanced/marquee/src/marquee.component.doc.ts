import { Input, Directive } from '@angular/core';

/**
 * The wmMarquee component defines the marquee widget.
 */
@Directive()
export class Marquee {

    /**
     * Name of the marquee widget.
     */
    @Input() name: string;

    /**
     * Class of the widget.
     */
    @Input() class: string;

    /**
     * Direction of the scroll for the content in the marquee widget.  <br>
     * <p><em>Allowed Values: </em><code>up, down, left, right</code></p>
     *
     */
    @Input() direction: string;

    /**
     * Speed of the scroll for the marquee widget content.
     */
    @Input() scrollamount: number;

    /**
     * Sets the delay in scroll of the Marquee.
     */
    @Input() scrolldelay:number;

    /**
     * This property will be used to show/hide the marquee widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;

}