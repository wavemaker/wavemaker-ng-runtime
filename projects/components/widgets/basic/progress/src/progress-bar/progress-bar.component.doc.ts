import { Input } from '@angular/core';

/**
 * The wmProgressBar component defines the progress bar widget.
 */

export class ProgressBar {

    /**
     * Class of the widget.
     */
    @Input() class: string;

    /**
     * Name of the progress bar widget.
     */
    @Input() name: string;

    /**
     * Type of the bar to be displayed. <br>
     * <p><em>Allowed Values: </em><code>default, default-striped, success, success-striped, info, info-striped, warning, warning-striped, danger, danger-striped</code></p>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() type: string = 'default';

    /**
     * Hint text is shown for the progress bar widget on hover. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() hint: string;

    /**
     * This property specifies the tab order of the progress bar widget.
     */
    @Input() tabindex: number;

    /**
     * This property will be used to show/hide the progress bar widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;

    /**
     * This property allows user to bind a variable to populate the list of values to display.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() dataset: any;

    /**
     * This property allows user to set an initial value to the progress bar widget
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() datavalue: string | number = 30;

    /**
     * This property allows user to set a min value to the progress bar widget
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() minvalue: number = 0;

    /**
     * This property allows user to set a max value to the progress bar widget
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() maxvalue: number = 100;

    /**
     * Format(Absolute/Percentage) in which the progress needs to be displayed.
     * <p><em>Allowed Values: </em><code>9, 9.9, 9.99, 9.999, 9%, 9.9%, 9.99%, 9.999%</code></p>
     */
    @Input() displayformat: string = '';

    /**
     * Placement of progress bar value.
     * <p><em>Allowed Values: </em><code>hidden, inside</code></p>
     */
    @Input() captionplacement: string = 'hidden';

    /**
     * Time interval in milli seconds to poll the service.
     */
    @Input() pollinterval: number = 0;

    /**
     * Callback function which will be triggered when the widget is clicked.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the progress bar widget
     */
    onClick($event: MouseEvent, widget: any) {}

    /**
     * Callback function which will be triggered when the widget is double clicked.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the progress bar widget
     */
    onDblclick($event: MouseEvent, widget: any) {}

    /**
     * Callback function which will be triggered when the mouse enters the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the progress bar widget
     */
   onMouseenter($event: MouseEvent, widget: any) {}

    /**
     * Callback function which will be triggered when the mouse leaves the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the progress bar widget
     */
    onMouseleave($event: MouseEvent, widget: any) {}

    /**
     * Callback function which will be triggered when the tap event is triggered on a widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the progress bar widget
     */
    onTap($event: TouchEvent, widget: any) {}

    /**
     * Callback function which will be triggered when the double tap event is triggered on a widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the progress bar widget
     */
    onDoubletap($event: TouchEvent, widget: any) {}

    /**
     * Callback function which will be triggered on start of the progress.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the progress bar widget
     */
    onStart($event: MouseEvent, widget: any) {}

    /**
     * Callback function which will be triggered on complete of the progress.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the progress bar widget
     */
    onComplete($event: MouseEvent, widget: any) {}

    /**
     * Callback function which will be triggered on before update of the progress.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the progress bar widget
     */
    onBeforeupdate($event: MouseEvent, widget: any) {}

}
