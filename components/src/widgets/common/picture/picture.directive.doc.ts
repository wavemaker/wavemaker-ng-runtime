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
     * Title/hint for the Picture. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() hint: string;
    /**
     * This property specifies the tab order of the Picture Widget.
     */
    @Input() tabindex: number = 0;
    /**
     * This property specifies the source for the picture. The source can be either a file or a url:\r\n File: enter the directory and filename for the image to display (supported filetypes include .jpg, .gif and .png). By default, WaveMaker looks for images in the src/main/webapp directory of the project. Every WaveMaker project has a data directory under src/main/webapp, so this is a good place to put pictures.\r\n URL: enter a url to any internet-accessible image. \r\n  To display the file, foo.jpg, in the project directory src/main/webapp/resources/images/imagelists/, enter the following into the source property:resources/images/imagelists/foo.jpg or simply foo.jpg
     */
    @Input() picturesource;
    /**
     * This property specifies the placeholder source for the picture when picturesource is not defined.<br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() pictureplaceholder;
    /**
     * This property can automatically size an image to the height or width of the picture widget. The options are: \r\n none: the image is displayed at its default size \r\n h: the image is resized so that the width of the image is the same as the width of the picture widget \r\n v: the image is resized so that the height of the image is the same as the height of the picture widget \r\n Both: the image is resized so that the height and width of the image is the same as the height of the picture widget<br>
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
     * This property will be used to show/hide the button widget on the web page. <br>
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
    click($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the widget is double clicked.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the button widget
     */
    dblclick($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the mouse enters the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the button widget
     */
    mouseenter($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the mouse leaves the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the button widget
     */
    mouseleave($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered the tap event is triggered on a widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the button widget
     */
    tap($event: TouchEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the double tap event is triggered on a widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the button widget
     */
    doubletap($event: TouchEvent, widget: any) {}

}