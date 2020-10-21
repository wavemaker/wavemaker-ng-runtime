import { Input } from '@angular/core';

/**
 * The wmProgressCircle component defines the progress circle widget.
 */

export class CircleProgressBar {

    /**
     * Title for the widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() title: string;

    /**
     * Subtitle for the widget. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() subtitle: string;

    /**
     * Class of the widget.
     */
    @Input() class: string;

    /**
     * Name of the widget.
     */
    @Input() name: string;

    /**
     * Type of the bar to be displayed. <br>
     * <p><em>Allowed Values: </em><code>default, success, info, warning, danger</code></p>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() type: string = 'default';

    /**
     * Hint text is shown for the progress circle widget on hover. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() hint: string;

    /**
     * This property specifies the tab order of the progress circle widget.
     */
    @Input() tabindex: number;

    /**
     * This property will be used to show/hide the progress circle widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;

    /**
     * This property allows user to set an initial value to the widget
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() datavalue: string|number = 30;

    /**
     * This property allows user to set a min value to the widget
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() minvalue: number = 0;

    /**
     * This property allows user to set a max value to the widget
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() maxvalue: number = 100;

    /**
     * Format(Absolute/Percentage) in which the progress needs to be displayed.
     * <p><em>Allowed Values: </em><code>9, 9.9, 9.99, 9.999, 9%, 9.9%, 9.99%, 9.999%</code></p>
     */
    @Input() displayformat: string = '9%';

    /**
     * Placement of text in the widget.
     * <p><em>Allowed Values: </em><code>hidden, inside</code></p>
     */
    @Input() captionplacement: string = 'hidden';


    /**
     * Callback function which will be triggered when the widget is clicked.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the widget
     */
    onClick($event: MouseEvent, widget: any) {}

    /**
     * Callback function which will be triggered when the widget is double clicked.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the widget
     */
    onDblclick($event: MouseEvent, widget: any) {}

    /**
     * Callback function which will be triggered when the mouse enters the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the widget
     */
   onMouseenter($event: MouseEvent, widget: any) {}

    /**
     * Callback function which will be triggered when the mouse leaves the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the widget
     */
    onMouseleave($event: MouseEvent, widget: any) {}

    /**
     * Callback function which will be triggered when the tap event is triggered on a widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the widget
     */
    onTap($event: TouchEvent, widget: any) {}

    /**
     * Callback function which will be triggered when the double tap event is triggered on a widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the widget
     */
    onDoubletap($event: TouchEvent, widget: any) {}
}
