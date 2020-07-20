import { Input, Directive } from '@angular/core';

/**
 * The wmSlider component defines the slider widget.
 */
@Directive()
export class Slider {
    /**
     * Class of the widget.
     */
    @Input() class: string;
    /**
     * This property will be used to disable/enable the slider widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() disabled: boolean;
    /**
     * Hint text is shown for the button widget on hover. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() hint: string;
    /**
     * Name of the slider widget.
     */
    @Input() name: string;
    /**
     * The shortcut key property specifies a shortcut key to activate/focus an element.
     */
    @Input() shortcutkey: string;
    /**
     * This property will be used to show/hide the slider widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;
    /**
     * This property will be used to make the rich-text-editor widget non-editable on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() readonly: boolean = false;
    /**
     * This property specifies the tab order of the slider Widget.
     */
    @Input() tabindex: number = 0;
    /**
     * This is the default value to display value for an editor widget. Note that the display value is just what the user sees initially, and is not always the dataValue returned by the widget.<br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() datavalue: number;
    /**
     * Bind or enter a minimum value to the slider<br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() minvalue: number;
    /**
     * Bind or enter a maximum value to the slider<br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() maxvalue: number;
    /**
     * Use the stepper to increment/decrement the input value by the specified step interval.
     */
    @Input() step: number;
    /**
     * Callback function which will be triggered when the widget is clicked or when datavalue has changed.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the slider widget
     * @param newVal  datavalue of the slider widget
     * @param oldVal  previously selected datavalue of the slider widget
     */
    onChange($event: MouseEvent, widget: any, newVal: number, oldVal: number) {}
}