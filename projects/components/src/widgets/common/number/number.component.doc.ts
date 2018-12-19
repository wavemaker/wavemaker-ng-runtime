import { Input } from '@angular/core';

/**
 * The wmNumber component defines the number widget.
 */
export class Number {
    /**
     * Class of the widget.
     */
    @Input() class: string;
    /**
     * Value to be shown in the text box.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() datavalue: string;
    /**
     * This property will be used to disable/enable the widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() disabled: boolean;
    /**
     * Hint text is shown for the widget on hover. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() hint: string;
    /**
     * Maximum value for the number.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() maxvalue: number;
    /**
     * Minimum value for number.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() minvalue: number;
    /**
     * Name of the number widget.
     */
    @Input() name: string;
    /**
     * Placeholder text for the widget.
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() placeholder: string = 'Enter value';
    /**
     * This property will be used to make the widget non-editable on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() readonly: boolean;
    /**
     * This property defines if the number is a required field while form submission. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() required: boolean;
    /**
     * The shortcut key property specifies a shortcut key to activate/focus an element.
     */
    @Input() shortcutkey: string;
    /**
     * This property will be used to show/hide the widget on the web page. <br>
     * <p><em>Bindable: </em><code>true</code></p>
     */
    @Input() show: boolean = true;
    /**
     *  This property will be used to increment/decrement the number value by the specified step interval.
     */
    @Input() step: number;
    /**
     * This property specifies the tab order of the Widget.
     */
    @Input() tabindex: number = 0;

    /**
     * Callback function which will be triggered when the widget value is changed.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the textarea widget
     * @param newVal  datavalue of the textarea widget
     * @param oldVal  previously selected datavalue of the textarea widget
     */
    onChange($event: Event, widget: any, newVal: string|number, oldVal: string|number) {}
    /**
     * Callback function which will be triggered when the widget loses focus.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the textarea widget
     */
    onBlur($event: Event, widget: any) {}
    /**
     * Callback function which will be triggered when the widget gets focused.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the textarea widget
     */
    onFocus($event: Event, widget: any) {}
    /**
     * Callback function which will be triggered when the widget is clicked.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the textarea widget
     */
    onClick($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the mouse enters the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the textarea widget
     */
    onMouseenter($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the mouse leaves the widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the textarea widget
     */
    onMouseleave($event: MouseEvent, widget: any) {}
    /**
     * Callback function which will be triggered when the tap event is triggered on a widget.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the textarea widget
     */
    onTap($event: TouchEvent, widget: any) {}
    /**
     * Callback function which will be triggered whenever a key is pressed down.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the textarea widget
     */
    onKeydown($event: KeyboardEvent, widget: any) {}
    /**
     * Callback function which will be triggered whenever a key is pressed.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the textarea widget
     */
    onKeypress($event: KeyboardEvent, widget: any) {}
    /**
     * Callback function which will be triggered whenever a key is released.
     * @param $event  DOM event on which call back is triggered
     * @param widget  Instance of the textarea widget
     * @returns {void} This method does not return anything
     */
    onKeyup($event: KeyboardEvent, widget: any) {}
}