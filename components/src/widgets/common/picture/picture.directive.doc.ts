import { Input } from '@angular/core';

/**
 * The `wmPicture` directive defines the Picture widget.
 */
export class Picture {
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
     * Name of the Picture widget.
     */
    @Input() name: string;
    /**
     * Hint text is shown for the Picture widget on hover. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() hint: string;
    /**
     * This property specifies the tab order of the Picture Widget.
     */
    @Input() tabindex: number = 0;
    /**
     * This property specifies the source for the picture.
     */
    @Input() picturesource;
    /**
     * This property specifies the placeholder source for the picture when picturesource is not defined.<br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() pictureplaceholder;
    /**
     * This property can automatically size an image to the height or width of the picture widget.<br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() pictureaspect;
    /**
     * Shape of the Picture widget. <br>
     * <p><em>Allowed Values: </em><code>rounded, circle, thumbnail</code></p>
     * <div class="summary">
     * <p><code>rounded</code><em>: Adds rounded corners to an image</em></p>
     * <p><code>circle</code><em>: Shapes the image to a circle</em></p>
     * <p><code>thumbnail</code><em>:  Shapes the image to a thumbnail</em></p>
     * </div>
     */
    @Input() shape;
    /**
     * This property will be used to show/hide the picture widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;
    /**
     * This property will be used to encode the provided URL at run time.
     */
    @Input() encodeurl: boolean = false;
    /**
     * Callback function which will be triggered when the widget is clicked.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the button widget
     */
    onClick($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget is double clicked.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the button widget
     */
    onDblclick($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the mouse enters the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the button widget
     */
   onMouseenter($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the mouse leaves the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the button widget
     */
    onMouseleave($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the tap event is triggered on a widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the button widget
     */
    onTap($event: TouchEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the double tap event is triggered on a widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the button widget
     */
    onDoubletap($event: TouchEvent, widget: any) {}

}